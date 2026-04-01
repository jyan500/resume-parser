from functools import wraps
from flask import request, jsonify
from pydantic import BaseModel, ValidationError, field_validator, model_validator
from utils.keywords.functions import get_cached_keywords
from typing import Any
import traceback
from db.models import JobTitle

JD_ANCHOR_KEYWORDS = [
    "responsibilities", "requirements", "qualifications",
    "experience", "skills", "you will", "we are looking",
    "what you'll do", "about the role", "benefits", "compensation"
]

JD_ANCHOR_MIN_MATCHES = 2

class TailorRequest(BaseModel):
    jobTitleId: str
    jobDescription: str
    resume: dict[str, Any]

    @field_validator("jobTitleId")
    @classmethod
    def validate_job_title_id(cls, v: str) -> str:
        v = v.strip()
        # we allow an empty string, assuming job description is also submitted
        if (v == ""):
            return v
        cached = get_cached_keywords(v)
        job_title = JobTitle.query.get(v)
        if not job_title:
            raise ValueError("Job Title not found!")
        if not cached:
            raise ValueError("No keywords found!")
        # if not v:
        #     return v
        # if len(v) < 2:
        #     raise ValueError("Job title is too short.")
        # if "\n" in v:
        #     raise ValueError("Job title must be a single line.")
        # if len(v) > 100:
        #     raise ValueError(
        #         "Job title is too long — please enter just the role name, e.g. 'Senior Frontend Engineer'."
        #     )
        # if len(v.split()) > 15:
        #     raise ValueError(
        #         "Job title seems too long. Please enter just the role name, e.g. 'Senior Frontend Engineer'."
        #     )
        return v

    @field_validator("jobDescription")
    @classmethod
    def validate_job_description(cls, v: str) -> str:
        v = v.strip()
        if not v:
            return v
        word_count = len(v.split())
        if len(v) < 150 or word_count < 50:
            raise ValueError(
                "Job description is too short. Please paste the full job description "
                "including the requirements or qualifications section."
            )
        if len(v) > 15_000:
            raise ValueError(
                "Job description is too long. Try pasting only the responsibilities "
                "and requirements sections (max 15,000 characters)."
            )
        matches = sum(1 for kw in JD_ANCHOR_KEYWORDS if kw in v.lower())
        if matches < JD_ANCHOR_MIN_MATCHES:
            raise ValueError(
                "This doesn't look like a job description. Please paste the full posting "
                "including responsibilities and requirements."
            )
        return v

    @field_validator("resume")
    @classmethod
    def validate_resume(cls, v: dict) -> dict:
        experience = v.get("experience", [])
        projects = v.get("projects", [])
        if not experience and not projects:
            raise ValueError(
                "Resume is missing experience/projects section and cannot be evaluated."
            )
        return v

    @model_validator(mode="after")
    def validate_title_or_description_and_bullets(self) -> "TailorRequest":
        if not self.jobTitleId.strip() and not self.jobDescription.strip():
            raise ValueError(
                "Provide either a job title or a job description (both cannot be empty)."
            )
        sections = [
            ("experience", self.resume.get("experience", [])),
            ("projects", self.resume.get("projects", [])),
        ]
        for section_name, entries in sections:
            for entry in entries:
                bullets = entry.get("bullets", [])
                if len(bullets) > 10:
                    raise ValueError(
                        f"An entry in '{section_name}' has too many bullet points."
                    )
                for bullet in bullets:
                    word_count = len(bullet["text"].split())
                    if word_count > 60 or len(bullet) > 400:
                        raise ValueError(
                            f"A bullet point in '{section_name}' is too long. "
                            "Each bullet should be a single concise sentence."
                        )
        return self


def validate_tailor_request(f):
    """Decorator that validates the request body against TailorRequest before the endpoint executes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        data = request.json or {}
        try:
            TailorRequest.model_validate(data)
        except ValueError as e:
            # Collect all Pydantic error messages into a single list
            errors = [err["msg"].removeprefix("Value error, ") for err in e.errors()]
            return jsonify({"errors": errors}), 422
        except Exception as e:
            traceback.print_exc()
            return jsonify({"errors": ["Something went wrong!"]}), 500
        return f(*args, **kwargs)
    return decorated
