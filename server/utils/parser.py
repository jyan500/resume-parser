import pdfplumber
import docx2txt
import re
import traceback
import json
import os
from jinja2 import Template
from google import genai
from utils.schema import ResumeSchema
from utils.functions import load_prompt
from utils.constants import (
    MAX_PAGES,
    MAX_WORDS,
    GEMINI_FLASH_LITE_MODEL,
    SECTION_PATTERNS,
)

class ResumeParser:
    def __init__(self):
        self.client = genai.Client()
        ## render using jinja2 to escape curly braces
        self.template = Template(load_prompt("parse-resume"))

    def parse_resume(self, filepath):
        try:
            """Extract text from resume file"""
            if filepath.endswith('.pdf'):
                text, page_count = self._parse_pdf(filepath)
            elif filepath.endswith('.docx'):
                text, page_count = self._parse_docx(filepath)
            else:
                raise ValueError('Unsupported file format')

            text = self._clean_text(text)
            is_valid, error = self._validate_length(text, page_count)
            if not is_valid:
                raise ValueError(error)
            sections = self._identify_sections(text)
            # if none of the sections are filled out, this is likely not a valid resume document
            if len(sections["_meta"]["section_start_line"]) == 0:
                raise ValueError("Please upload a valid resume")

            prompt = self.template.render(text=json.dumps(sections))
            response = self.client.models.generate_content(
                model=GEMINI_FLASH_LITE_MODEL, 
                contents={
                    prompt
                },
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": ResumeSchema.model_json_schema(),
                },
            )
            parsed_resume = ResumeSchema.model_validate_json(response.text)
            parsed_resume_dict = parsed_resume.model_dump()
            return self._clean_parse_result(parsed_resume_dict, sections)
            # TODO: unused file upload code in case the text based parsing
            # doesn't work out
            # uploaded_file = self.client.files.upload(file=filepath)
            # file_name = uploaded_file.name
            # print("file_name: ", file_name)
            # myfile = self.client.files.get(name=file_name)
            # if (myfile):
            #     response = self.client.models.generate_content(
            #         model=GEMINI_FLASH_LITE_MODEL, 
            #         contents=[
            #             prompt,
            #             myfile,
            #         ],
            #         config={
            #             "response_mime_type": "application/json",
            #             "response_json_schema": ResumeSchema.model_json_schema(),
            #         },
            #     )
            #     self.client.files.delete(name=myfile.name)
            #     parsed_resume = ResumeSchema.model_validate_json(response.text)
            #     parsed_resume_dict = parsed_resume.model_dump()
            #     return self._clean_parse_result(parsed_resume_dict, sections)
            return sections
        
        except Exception as e:
            raise e

    def _parse_pdf(self, filepath):
        text = ''
        with pdfplumber.open(filepath) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                text += page.extract_text() + '\n'
        return (text.strip(), page_count)

    def _parse_docx(self, filepath):
        """Extract text from Word document"""
        text = docx2txt.process(filepath)
        return (text.strip(), None)

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

    def _validate_length(self, text: str, page_count: int = None):
        word_count = len(text.split())
    
        if page_count and page_count > MAX_PAGES:
            return (False, f"Document exceeds {MAX_PAGES} pages. Please upload a resume.")
        
        if word_count > MAX_WORDS:
            return (False, f"Document is too long to be a resume ({word_count} words). Please upload a 1–2 page resume.")

        return (True, "")

    def _clean_parse_result(self, parsed_result, sections): 
        """ 
            validate the results between parsed_result and sections 
            if a section is present in sections, but the same section in parsed_result
            doesn't have a value, just take the non-parsed section.

            TODO: This seems to be happening specifically with professional summaries that 
            are being missed by the LLM, so this is a workaround for that.
        """
        result = {**parsed_result} 
        section_headers = {**SECTION_PATTERNS, "header": ""}
        for key in section_headers:
            if key in result:
                if key == "summary":
                    # if the LLM did not catch the summary, just add the summary from
                    # the parsed section back in
                    if parsed_result["summary"] == "" and sections["summary"] != "":
                        result[key] = sections["summary"]
                    # if the LLM incorrectly generated a summary, remove it
                    elif parsed_result["summary"] != "" and sections["summary"] == "":
                        result[key] = ""
                # make sure we don't include any sections that were not originally included
                # in our sections parse
                else:
                    result[key] = parsed_result[key]
        return result

    def _identify_sections(self, text):
        """ Split resume into sections based on common headers """

        lines = text.split("\n")
        sections = {}
        current_section = None
        current_content = []
        section_start_line = {}

        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if not line_stripped:
                continue

            # check if this line is a section header
            is_header = False
            for section_name, pattern in SECTION_PATTERNS.items():
                if re.match(pattern, line_stripped):
                    # If we've found a section, save previous section
                    # and all of its content in the sections dict
                    if current_section:
                        sections[current_section] = " ".join(current_content)

                    # Start new section
                    current_section = section_name
                    current_content = []

                    # save the line number where the new section begins
                    section_start_line[section_name] = i
                    is_header = True
                    break

            # save all content between each section
            if not is_header and current_section:
                current_content.append(line)

        # add the last section found (if available)
        if current_section != None and len(current_content) > 0:
            sections[current_section] = "\n".join(current_content)

        # Store the line numbers where each section starts (for header extraction) 
        sections["_meta"] = {"section_start_line": section_start_line}

        # Get text before first section (usually contact info)
        header_lines = []

        # Find where first section starts
        meta = sections.get("_meta", {})
        section_starts = meta.get("section_start_line", {})
        # find the first section
        if len(section_starts.values()):
            first_section_line = min(section_starts.values() if section_starts else len(lines))
            # Get lines before first section (typically first 5-10 lines)
            header_text = "\n".join(lines[:min(first_section_line, 15)])

            sections["header"] = header_text
        return sections
