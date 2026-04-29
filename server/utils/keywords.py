import re
import traceback
from jinja2 import Template
from utils.schemas.keywords_schema import KeywordListSchema
from utils.schemas.tailor_resume_schema import Keyword
from utils.functions import load_prompt, split_prompt
from utils.client import LLMClient


def _collect_bullet_text(resume: dict) -> str:
    parts: list[str] = []
    for entry in resume.get("experience") or []:
        for bullet in entry.get("bullets") or []:
            text = bullet.get("text") if isinstance(bullet, dict) else bullet
            if text:
                parts.append(text)
    for entry in resume.get("projects") or []:
        for bullet in entry.get("bullets") or []:
            text = bullet.get("text") if isinstance(bullet, dict) else bullet
            if text:
                parts.append(text)
    return "\n".join(parts)


def _collect_skill_strings(resume: dict) -> list[str]:
    out: list[str] = []
    for category in resume.get("skills") or []:
        # Server schema field is `skills`; client sends `items`. Accept either.
        items = category.get("skills") if isinstance(category, dict) else None
        if items is None and isinstance(category, dict):
            items = category.get("items")
        for item in items or []:
            if item:
                out.append(item)
    return out


class KeywordExtractor:
    def __init__(self):
        self.client = LLMClient("gemini")
        self._template = Template(load_prompt("extract-jd-keywords"))

    def extract(self, job_title: str, job_description: str) -> list[Keyword]:
        rendered = self._template.render(
            job_title=job_title,
            job_description=job_description,
        )
        system_prompt, user_prompt = split_prompt(rendered)
        result = self.client.generate_response(
            user_prompt,
            "KeywordListSchema",
            KeywordListSchema,
            system_prompt=system_prompt,
            temperature=0.0,
        )
        return result.keywords

    def compute_missing(self, keywords: list[Keyword], resume: dict) -> list[dict]:
        bullets_text = _collect_bullet_text(resume)
        skill_strings = _collect_skill_strings(resume)

        missing: list[dict] = []
        for kw in keywords:
            text = kw.text.strip()
            if not text:
                continue
            pattern = re.compile(r"\b" + re.escape(text) + r"\b", re.IGNORECASE)
            if pattern.search(bullets_text):
                continue
            in_skills_only = any(pattern.search(s) for s in skill_strings)
            missing.append({
                "type": kw.type.value if hasattr(kw.type, "value") else kw.type,
                "text": text,
                "in_skills_only": in_skills_only,
            })
        return missing

    def get_missing_keywords(self, job_title: str, job_description: str, resume: dict) -> list[dict]:
        try:
            keywords = self.extract(job_title, job_description)
            return self.compute_missing(keywords, resume)
        except Exception:
            traceback.print_exc()
            raise Exception("Something went wrong while extracting keywords")
