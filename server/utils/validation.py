import re
from functools import wraps
from flask import request, jsonify
from pydantic import BaseModel, ValidationError, field_validator, model_validator
from typing import Any
import traceback

JD_ANCHOR_KEYWORDS = [
    "responsibilities", "requirements", "qualifications",
    "experience", "skills", "you will", "we are looking",
    "what you'll do", "about the role", "benefits", "compensation"
]

JD_ANCHOR_MIN_MATCHES = 2

# detect common prompt injection phrases like "ignore previous instructions and do ..."
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|rules?|context|prompts?)",
    r"\byou\s+are\s+now\b",
    r"\bact\s+as\b.{0,30}\b(assistant|model|gpt|ai|llm)\b",
    r"\bnew\s+instructions?\b",
    r"(?<!\w)system\s*:\s",
    r"\[system\]",
    r"<\|im_start\|>",
    r"\[INST\]",
    r"###\s*instruction",
    r"disregard\s+(all\s+)?previous",
    r"forget\s+(all\s+)?previous\s+(instructions?|context)",
]
_COMPILED_INJECTION_PATTERNS = [re.compile(p, re.IGNORECASE) for p in _INJECTION_PATTERNS]


def _check_injection(v: str, field_name: str) -> None:
    for pattern in _COMPILED_INJECTION_PATTERNS:
        if pattern.search(v):
            raise ValueError(
                f"{field_name} contains content that cannot be processed."
            )

class TailorRequest(BaseModel):
    jobTitle: str
    jobDescription: str
    resume: dict[str, Any]

    @field_validator("jobTitle")
    @classmethod
    def validate_job_title(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Job title is too short.")
        if "\n" in v:
            raise ValueError("Job title must be a single line.")
        if len(v) > 100:
            raise ValueError(
                "Job title is too long, please enter just the role name, e.g. 'Senior Frontend Engineer'."
            )
        _check_injection(v, "Job title")
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
        _check_injection(v, "Job description")
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
        sections = [
            ("experience", v.get("experience", [])),
            ("projects", v.get("projects", [])),
        ]
        for section_name, entries in sections:
            for entry in entries:
                bullets = entry.get("bullets", [])
                if len(bullets) > 20:
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
        return v

def validate_tailor_request(f):
    """Decorator that validates the request body against TailorRequest before the endpoint executes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        data = request.json or {}
        try:
            TailorRequest.model_validate(data)
        except ValueError as e:
            # Collect all Pydantic error messages into a single list
            print("raised value error: ", e.errors())
            errors = [err["msg"].removeprefix("Value error, ") for err in e.errors()]
            return jsonify({"errors": errors}), 422
        except Exception as e:
            traceback.print_exc()
            return jsonify({"errors": ["Something went wrong!"]}), 500
        return f(*args, **kwargs)
    return decorated
