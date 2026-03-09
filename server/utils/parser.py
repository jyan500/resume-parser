import pdfplumber
import docx2txt
import re
import traceback
import json
from google import genai
from utils.schema import ResumeSchema

class ResumeParser:
    def __init__(self):
        self.client = genai.Client()

    def parse_resume(self, filepath):
        """Extract text from resume file"""
        if filepath.endswith('.pdf'):
            text = self._parse_pdf(filepath)
        elif filepath.endswith('.docx'):
            text = self._parse_docx(filepath)
        else:
            raise ValueError('Unsupported file format')
        text = self._clean_text(text)
        prompt = f"""
            Please parse the following resume text into the requested structured JSON format.
            
            Specific instructions:
            1. Experience bullets: Must be complete sentences.
            2. Skills: Extract individual technologies only; ignore category headers (e.g., ignore 'Frontend').
            
            Resume Text:
            {text}
        """
        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite", 
            contents={prompt},
            config={
                "response_mime_type": "application/json",
                "response_json_schema": ResumeSchema.model_json_schema(),
            },
        )
        parsed_resume = ResumeSchema.model_validate_json(response.text)
        return parsed_resume.model_dump()

    def _parse_pdf(self, filepath):
        """Extract text from PDF"""
        text = ''
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + '\n'
        
        return text.strip()

    def _parse_docx(self, filepath):
        """Extract text from Word document"""
        text = docx2txt.process(filepath)
        return text.strip()
