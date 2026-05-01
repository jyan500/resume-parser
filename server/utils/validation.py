import re
from functools import wraps
from flask import request, jsonify
from pydantic import BaseModel, ValidationError, field_validator, model_validator
from typing import Any, Literal
from utils.leniency import LENIENCY_LEVEL_NAMES, DEFAULT_LENIENCY
import traceback

JD_KEYWORD_GROUPS = [
    # Role description
    [
        "responsibilities", "you will", "what you'll do", "day-to-day",
        "in this role", "about the role", "role overview", "your role",
        "what you do", "job duties", "primary duties",
    ],
    # Requirements / qualifications
    [
        "requirements", "qualifications", "required", "must have", "must-have",
        "minimum qualifications", "basic qualifications", "preferred qualifications",
        "what you bring", "what we're looking for", "who we're looking for",
        "we are looking for", "what you need", "your background",
        "desired skills", "prerequisites",
    ],
    # Skills / experience
    [
        "skills", "experience", "expertise",
        "years of experience", "proficiency in", "knowledge of", "background in",
    ],
    # Company / benefits
    [
        "we offer", "about us", "about the company", "our team",
        "join us", "why us", "benefits", "compensation", "perks", "what we offer",
    ],
    # Application process
    [
        "apply now", "to apply", "equal opportunity", "eeo",
        "interview process", "hiring process",
    ],
]

_JD_STRUCTURAL_PATTERNS = [re.compile(p, re.IGNORECASE) for p in [
    r"\d+\s*(?:\+|or\s+more)?\s*years?\b",
    r"\b(?:full[- ]?time|part[- ]?time|contract|remote|hybrid|on[- ]?site)\b",
    r"(?:\$[\d,]+|\d+k)\s*(?:–|-|to)\s*(?:\$[\d,]+|\d+k)",
    r"\b(?:bachelor(?:'s)?|master(?:'s)?|ph\.?d\.?|doctorate)\b",
]]

JD_MIN_SCORE = 2


def _score_job_description(text: str) -> int:
    lower = text.lower()
    score = 0
    # each successful pattern match results increments the score
    for group in JD_KEYWORD_GROUPS:
        if any(kw in lower for kw in group):
            score += 1
    for pattern in _JD_STRUCTURAL_PATTERNS:
        if pattern.search(text):
            score += 1
    # locate a bulleted list inside the job description text, as this likely signals it's a JD
    if len(re.findall(r"^\s*[-•*◦▪▸►✓✔]\s", text, re.MULTILINE)) >= 3:
        score += 1
    return score

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

class _ResumeJobBase(BaseModel):
    """Shared validators for endpoints that take a resume + job title + JD."""
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
        if _score_job_description(v) < JD_MIN_SCORE:
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

class KeywordInput(BaseModel):
    text: str
    type: Literal["Technical", "Soft Skill"]


class TailorRequest(_ResumeJobBase):
    promptVersion: str = DEFAULT_LENIENCY
    missingKeywords: list[KeywordInput] = []

    @field_validator("promptVersion")
    @classmethod
    def validate_prompt_version(cls, v: str) -> str:
        if v not in LENIENCY_LEVEL_NAMES:
            raise ValueError(
                f"promptVersion must be one of {list(LENIENCY_LEVEL_NAMES.keys())}"
            )
        return v


class MissingKeywordsRequest(_ResumeJobBase):
    pass


def _validate_with(model: type[BaseModel]):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.json or {}
            try:
                model.model_validate(data)
            except ValueError as e:
                # Collect all Pydantic error messages into a single list
                print("raised value error: ", e.errors())
                errors = [err["msg"].removeprefix("Value error, ") for err in e.errors()]
                return jsonify({"errors": errors}), 422
            except Exception:
                traceback.print_exc()
                return jsonify({"errors": ["Something went wrong!"]}), 500
            return f(*args, **kwargs)
        return decorated
    return decorator


validate_tailor_request = _validate_with(TailorRequest)
validate_missing_keywords_request = _validate_with(MissingKeywordsRequest)
