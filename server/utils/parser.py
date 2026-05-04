import pdfplumber
import docx2txt
import re
import traceback
import json
import os
from jinja2 import Template
from utils.client import LLMClient
from utils.schemas.schema import ResumeSchema
from utils.functions import load_prompt
from utils.constants import (
    MAX_PAGES,
    MAX_WORDS,
    SECTION_PATTERNS,
)
import zipfile
import xml.etree.ElementTree as ET

class ResumeParser:
    def __init__(self):
        self.llm_client = LLMClient(mode="gemini")
        ## render using jinja2 to escape curly braces
        # self.template = Template(load_prompt("parse-resume"))
        self.uploadTemplate = Template(load_prompt("parse-resume-file"))
        self.textTemplate = Template(load_prompt("parse-resume"))

    def parse_resume(self, filepath):
        try:
            if filepath.endswith('.pdf'):
                text = self._parse_pdf(filepath)
                text = self._clean_text(text)
                is_valid, error = self._validate_length(text)
                if not is_valid:
                    raise ValueError(error)
                self._check_sections(text)

                prompt = self.uploadTemplate.render()
                myfile = self.llm_client.upload_file(filepath)
                if not myfile:
                    raise Exception("Something went wrong while uploading")
                parsed_resume = self.llm_client.generate_response(
                    prompt, "ResumeSchema", ResumeSchema, temperature=0.0, file=myfile, filepath=filepath
                )
                self.llm_client.delete_file(myfile)

            elif filepath.endswith('.docx'):
                text = self._parse_docx(filepath)
                text = self._clean_text(text)
                is_valid, error = self._validate_length(text)
                if not is_valid:
                    raise ValueError(error)
                self._check_sections(text)

                # Gemini doesn't support .docx uploads — send extracted text inline instead
                prompt = self.textTemplate.render(text=text)
                parsed_resume = self.llm_client.generate_response(
                    prompt, "ResumeSchema", ResumeSchema, temperature=0.0
                )
            else:
                raise ValueError('Unsupported file format')

            return parsed_resume.model_dump()

        except Exception as e:
            traceback.print_exc()
            if isinstance(e, ValueError):
                raise e
            raise Exception("Something went wrong while uploading")


    def _check_sections(self, text):
        """Raises ValueError if no resume sections are detected."""
        if len(self._identify_resume_sections(text)) == 0:
            raise ValueError("Please upload a valid resume")

    def _parse_pdf(self, filepath):
        text = ''
        with pdfplumber.open(filepath) as pdf:
            page_count = len(pdf.pages)
            if (page_count > MAX_PAGES):
                raise ValueError(f"Document must be less than {MAX_PAGES} pages")
            for page in pdf.pages:
                text += page.extract_text()
        return text.strip()

    def _parse_docx(self, filepath):
        """Extract text from Word document"""
        # --- Fast page-count check (reads only docProps/app.xml from the ZIP) ---
        page_count = self._get_docx_page_count(filepath)
        if page_count is not None and page_count > MAX_PAGES:
            raise ValueError(
                f"Document must be less than {MAX_PAGES} pages"
            )
        text = docx2txt.process(filepath)
        return text.strip()
    
    def _get_docx_page_count(self, filepath):
        """Read page count from docProps/app.xml inside the .docx ZIP.
        
        Returns the page count as an int, or None if it cannot be determined.
        Note: this reflects the count from the last time Word saved/rendered
        the file, so it may be absent in programmatically-created docs.
        """
        try:
            with zipfile.ZipFile(filepath, "r") as zf:
                if "docProps/app.xml" not in zf.namelist():
                    return None
                with zf.open("docProps/app.xml") as f:
                    tree = ET.parse(f)
                    root = tree.getroot()

                # The namespace varies by Office version
                ns = {"ep": "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"}
                pages_el = root.find("ep:Pages", ns)

                if pages_el is not None and pages_el.text:
                    return int(pages_el.text)
        except (zipfile.BadZipFile, ET.ParseError, ValueError):
            return None

        return None

    def _clean_text(self, text: str) -> str:
        """ 
            Replace bullet points, convert curly to straight quotes and
            converts a single triple dot char into three individual dots
        """
        replacements = {
            '\u25cf': '-', '\u25cb': '-', '\u25a0': '-',
            '\u2022': '-', '\u2023': '-', '\u2043': '-',
            '\u2013': '-', '\u2014': '-', '\u2019': "'",
            '\u201c': '"', '\u201d': '"', '\u2026': '...',
        }
        for unicode_char, replacement in replacements.items():
            text = text.replace(unicode_char, replacement)

        return text

    def _validate_length(self, text: str):
        word_count = len(text.split())
        
        if word_count > MAX_WORDS:
            return (False, f"Document cannot exceed ({word_count} words).")

        return (True, "")

    def _identify_resume_sections(self, text):
        lines = text.split("\n")
        sections = set()
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
            for section_name, pattern in SECTION_PATTERNS.items():
                match = re.match(pattern, line_stripped)
                if match:
                    sections.add(match.group(0))
        return sections
