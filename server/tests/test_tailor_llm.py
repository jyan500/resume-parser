import json
import pytest
from unittest.mock import MagicMock

from utils.leniency import LENIENCY_LEVELS

VALID_JD = (
    "We are looking for a Senior Software Engineer with strong experience in Python "
    "and distributed systems. Responsibilities include designing scalable APIs. "
    "Requirements: 5 or more years of experience. Skills in Docker are valued. "
    "Competitive compensation and benefits."
)

RESUME_JSON = json.dumps({
    "experience": [
        {
            "company": "Acme Corp",
            "job_title": "Engineer",
            "bullets": [{"id": "b1", "text": "Built REST APIs using Python and Flask."}],
        }
    ],
    "projects": [],
})


class TestTailorResumeSuccess:
    def test_returns_dict_with_suggested_bullets_using_evaluation_loop(self, tailor):
        tailor._generate = MagicMock(return_value={"suggested_bullets": [
            {"id": "b1", "text": "Built REST APIs.", "new_text": "Designed scalable REST APIs."}
        ]})
        tailor._run_evaluation_loop = MagicMock(side_effect=lambda r, c, l: r)
        tailor.use_evaluation_loop = True

        result = tailor.tailor_resume(RESUME_JSON, "Software Engineer", VALID_JD)

        assert "suggested_bullets" in result
        tailor._generate.assert_called_once()
        tailor._run_evaluation_loop.assert_called_once()

    def test_returns_dict_with_suggested_bullets_not_using_evaluation_loop(self, tailor):
        tailor._generate = MagicMock(return_value={"suggested_bullets": [
            {"id": "b1", "text": "Built REST APIs.", "new_text": "Designed scalable REST APIs."}
        ]})
        tailor._run_evaluation_loop = MagicMock(side_effect=lambda r, c, l: r)
        tailor.use_evaluation_loop = False 

        result = tailor.tailor_resume(RESUME_JSON, "Software Engineer", VALID_JD)

        assert "suggested_bullets" in result
        tailor._generate.assert_called_once()


class TestTailorResumeErrors:
    def test_generate_exception_raises_with_expected_message(self, tailor):
        tailor._generate = MagicMock(side_effect=Exception("LLM error"))

        with pytest.raises(Exception, match="Something went wrong while tailoring resume"):
            tailor.tailor_resume(RESUME_JSON, "Engineer", VALID_JD)
