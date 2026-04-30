import io
import json
import pytest
from unittest.mock import patch

import app as app_module
from utils.leniency import DEFAULT_LENIENCY
from utils.routes import PARSE_RESUME_URL, TAILOR_RESUME_URL, MISSING_KEYWORDS_URL

VALID_JOB_TITLE = "Senior Software Engineer"
VALID_JD = (
    "We are looking for a Senior Software Engineer to join our engineering team. "
    "The ideal candidate will have strong experience with cloud infrastructure and "
    "distributed systems. Responsibilities include designing and implementing scalable "
    "microservices, reviewing code, and collaborating with cross-functional teams. "
    "Requirements: 5 or more years of Python or Java experience, proficiency with Docker "
    "and Kubernetes, familiarity with AWS or GCP. Skills in observability tools like "
    "Datadog or Grafana are valued. Competitive compensation and benefits package "
    "including health insurance, equity, and professional development opportunities."
)


class TestHealth:
    def test_returns_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json["status"] == "ok"


class TestParseResume:
    def test_no_file_returns_422(self, client):
        resp = client.post(PARSE_RESUME_URL)
        assert resp.status_code == 422
        assert "No resume file provided" in resp.json["errors"]

    def test_empty_filename_returns_422(self, client):
        data = {"resume": (io.BytesIO(b"content"), "")}
        resp = client.post(PARSE_RESUME_URL, data=data, content_type="multipart/form-data")
        assert resp.status_code == 422

    def test_success_returns_parsed_data(self, client):
        with patch.object(app_module, "parser") as mock_parser:
            mock_parser.parse_resume.return_value = {"header": {"first_name": "Jane"}, "experience": []}
            data = {"resume": (io.BytesIO(b"%PDF fake"), "resume.pdf")}
            resp = client.post(PARSE_RESUME_URL, data=data, content_type="multipart/form-data")
        assert resp.status_code == 200
        assert "header" in resp.json

    def test_value_error_returns_422(self, client):
        with patch.object(app_module, "parser") as mock_parser:
            mock_parser.parse_resume.side_effect = ValueError("Please upload a valid resume")
            data = {"resume": (io.BytesIO(b"%PDF fake"), "resume.pdf")}
            resp = client.post(PARSE_RESUME_URL, data=data, content_type="multipart/form-data")
        assert resp.status_code == 422
        assert "Please upload a valid resume" in resp.json["errors"]

    def test_unexpected_exception_returns_500(self, client):
        with patch.object(app_module, "parser") as mock_parser:
            mock_parser.parse_resume.side_effect = Exception("Unexpected")
            data = {"resume": (io.BytesIO(b"%PDF fake"), "resume.pdf")}
            resp = client.post(PARSE_RESUME_URL, data=data, content_type="multipart/form-data")
        assert resp.status_code == 500


class TestTailorResume:
    def _valid_body(self, sample_resume_json):
        return {
            "jobTitle": VALID_JOB_TITLE,
            "jobDescription": VALID_JD,
            "resume": sample_resume_json,
            "promptVersion": DEFAULT_LENIENCY,
        }

    def test_missing_job_title_returns_422(self, client, sample_resume_json):
        resp = client.post(TAILOR_RESUME_URL, json={
            "jobDescription": VALID_JD,
            "resume": sample_resume_json,
        })
        assert resp.status_code == 422

    def test_short_job_description_returns_422(self, client, sample_resume_json):
        resp = client.post(TAILOR_RESUME_URL, json={
            "jobTitle": VALID_JOB_TITLE,
            "jobDescription": "Too short.",
            "resume": sample_resume_json,
        })
        assert resp.status_code == 422

    def test_invalid_prompt_version_returns_422(self, client, sample_resume_json):
        body = self._valid_body(sample_resume_json)
        body["promptVersion"] = "aggressive"
        resp = client.post(TAILOR_RESUME_URL, json=body)
        assert resp.status_code == 422

    def test_success_returns_camelcased_response(self, client, sample_resume_json):
        with patch.object(app_module, "tailor") as mock_tailor:
            mock_tailor.tailor_resume.return_value = {
                "suggested_bullets": [
                    {"id": "b1", "text": "Built APIs.", "new_text": "Designed scalable APIs."}
                ]
            }
            resp = client.post(TAILOR_RESUME_URL, json=self._valid_body(sample_resume_json))
        assert resp.status_code == 200
        assert "suggestedBullets" in resp.json

    def test_tailor_exception_returns_500(self, client, sample_resume_json):
        with patch.object(app_module, "tailor") as mock_tailor:
            mock_tailor.tailor_resume.side_effect = Exception("LLM error")
            resp = client.post(TAILOR_RESUME_URL, json=self._valid_body(sample_resume_json))
        assert resp.status_code == 500


class TestMissingKeywords:
    def _valid_body(self, sample_resume_json):
        return {
            "jobTitle": VALID_JOB_TITLE,
            "jobDescription": VALID_JD,
            "resume": sample_resume_json,
        }

    def test_missing_job_title_returns_422(self, client, sample_resume_json):
        resp = client.post(MISSING_KEYWORDS_URL, json={
            "jobDescription": VALID_JD,
            "resume": sample_resume_json,
        })
        assert resp.status_code == 422

    def test_success_returns_keywords(self, client, sample_resume_json):
        with patch.object(app_module, "keyword_extractor") as mock_extractor:
            mock_extractor.get_missing_keywords.return_value = [
                {"type": "Technical", "text": "React", "in_skills_only": False}
            ]
            resp = client.post(MISSING_KEYWORDS_URL, json=self._valid_body(sample_resume_json))
        assert resp.status_code == 200
        assert "keywords" in resp.json

    def test_extractor_exception_returns_500(self, client, sample_resume_json):
        with patch.object(app_module, "keyword_extractor") as mock_extractor:
            mock_extractor.get_missing_keywords.side_effect = Exception("LLM error")
            resp = client.post(MISSING_KEYWORDS_URL, json=self._valid_body(sample_resume_json))
        assert resp.status_code == 500
