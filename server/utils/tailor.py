from nt import environ
import re
import traceback
import json
import os
from jinja2 import Template
from google import genai
from openai import OpenAI
from db.models import JobTitle
from utils.constants import GEMINI_FLASH_MODEL, GEMINI_FLASH_LITE_MODEL, MINIMAX_M2_5_MODEL
from utils.schemas.tailor_resume_schema import TailorJobSchema
from utils.schemas.keywords_schema import KeywordListSchema
from utils.keywords.functions import save_keywords, get_cached_keywords
from utils.functions import load_prompt
from utils.client import LLMClient
from pydantic import BaseModel

class TailorResume:
    def __init__(self):
        ## render using jinja2 to escape curly braces
        self.client = LLMClient("openrouter")
        self.template = Template(load_prompt("tailor-resume-job-v2"))
        self.job_title_template = Template(load_prompt("tailor-resume-job-title-v2"))
        self.keyword_template = Template(load_prompt("derive-keywords"))
    
    # tailor based on both the job description
    def tailor_resume(self, resume_json_string, job_description):
        try:
            prompt = self.template.render(resume=resume_json_string, job_description=job_description)
            schema_response = self.client.generate_response(prompt, "TailorJobSchema", TailorJobSchema) 
            return schema_response.model_dump()
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")

    # tailor resume based on job title only (not on job description) 
    def tailor_resume_job_title(self, resume_json_string, job_title_id):
        try:
            cached = get_cached_keywords(job_title_id)
            job_title = JobTitle.query.get(job_title_id)
            # if cached is None:
            #     # cache miss — derive from LLM and save
            #     cached = self._derive_and_cache_keywords(job_title)
            prompt = self.job_title_template.render(resume=resume_json_string, job_title=job_title.name)
            schema_response = self.client.generate_response(prompt, "TailorJobSchema", TailorJobSchema)
            return schema_response.model_dump()
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")
    
    def _derive_and_cache_keywords(self, job_title: str) -> list[dict]:
        try:
            prompt = self.keyword_template.render(job_title=job_title)
            schema_response = self.client.generate_response(prompt, "KeywordListSchema", KeywordListSchema)
            keywords = [kw.model_dump() for kw in schema_response.keywords]
            save_keywords(job_title, keywords)
            return keywords

        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")

