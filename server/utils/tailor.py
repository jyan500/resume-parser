import re
import traceback
import json
import os
from jinja2 import Template
from google import genai
from utils.constants import GEMINI_FLASH_MODEL, GEMINI_FLASH_LITE_MODEL
from utils.schemas.tailor_resume_schema import TailorJobSchema
from utils.schemas.keywords_schema import KeywordListSchema
from utils.keywords.functions import save_keywords, get_cached_keywords, normalize_title
from utils.functions import load_prompt

class TailorResume:
    def __init__(self):
        self.client = genai.Client()
        ## render using jinja2 to escape curly braces
        self.template = Template(load_prompt("tailor-resume"))
        self.job_title_template = Template(load_prompt("tailor-resume-job-title"))
        self.keyword_template = Template(load_prompt("derive-keywords"))

    # tailor based on both the job description and job title
    def tailor_resume(self, resume_json_string, job_title, job_description):
        try:
            prompt = self.template.render(resume=resume_json_string, job_title=job_title, job_description=job_description)
            response = self.client.models.generate_content(
                model=GEMINI_FLASH_MODEL,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": TailorJobSchema.model_json_schema(),
                },
            )
            validated_schema = TailorJobSchema.model_validate_json(response.text)
            return validated_schema.model_dump()
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")

    # tailor resume based on job title only (not on job description) 
    def tailor_resume_job_title(self, resume_json_string, job_title):
        try:
            normalized = normalize_title(job_title)
            cached = get_cached_keywords(normalized)

            if cached is None:
                # cache miss — derive from LLM and save
                cached = self._derive_and_cache_keywords(normalized)
            
            prompt = self.job_title_template.render(resume=resume_json_string, job_title=job_title)
            response = self.client.models.generate_content(
                model=GEMINI_FLASH_MODEL,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": TailorJobSchema.model_json_schema(),
                },
            )
            validated_schema = TailorJobSchema.model_validate_json(response.text)
            return validated_schema.model_dump()
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")
    
    def _derive_and_cache_keywords(self, job_title: str) -> list[dict]:
        try:
            prompt = self.keyword_template.render(job_title=job_title)
            response = self.client.models.generate_content(
                model=GEMINI_FLASH_LITE_MODEL,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": KeywordListSchema.model_json_schema(),
                },
            )
            validated = KeywordListSchema.model_validate_json(response.text)
            keywords = [kw.model_dump() for kw in validated.keywords]
            save_keywords(job_title, keywords)
            return keywords

        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")

