import re
import traceback
import json
import os
from jinja2 import Template
from google import genai
from utils.constants import GEMINI_FLASH_MODEL, GEMINI_FLASH_LITE_MODEL
from utils.tailor_resume_schema import TailorResumeSchema
from utils.functions import load_prompt

class TailorResume:
    def __init__(self):
        self.client = genai.Client()
        ## render using jinja2 to escape curly braces
        self.template = Template(load_prompt("tailor-resume"))

    def tailor_resume(self, resume_json_string, job_title, job_description):
        try:
            prompt = self.template.render(resume=resume_json_string, job_title=job_title, job_description=job_description)
            response = self.client.models.generate_content(
                model=GEMINI_FLASH_LITE_MODEL,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": TailorResumeSchema.model_json_schema(),
                },
            )
            validated_schema = TailorResumeSchema.model_validate_json(response.text)
            return validated_schema.model_dump()
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")

