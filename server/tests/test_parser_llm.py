import json
import pytest
from unittest.mock import MagicMock, patch

RESUME_TEXT_WITH_SECTIONS = (
    "Jane Doe\njane@test.com\n\nExperience\nSoftware Engineer at Acme 2021-Present\n"
    "- Built REST APIs using Python.\n\nEducation\nState University 2020\n\nSkills\nPython Docker"
)

MINIMAL_RESUME_SCHEMA_JSON = json.dumps({
    "header": {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@test.com",
        "location": "",
        "phone_number": "",
        "urls": [],
    },
    "summary": "",
    "education": [],
    "certifications": [],
    "experience": [
        {
            "company": "Acme Corp",
            "location": "",
            "work_type": "",
            "job_title": "Engineer",
            "start_date": "2021-01",
            "end_date": "Present",
            "bullets": ["Built REST APIs using Python."],
        }
    ],
    "skills": [],
    "projects": [],
    "languages": [],
    "interests": [],
})


def make_mock_client(response_text=MINIMAL_RESUME_SCHEMA_JSON):
    client = MagicMock()
    mock_file = MagicMock()
    mock_file.name = "files/test-abc123"
    client.files.upload.return_value = mock_file
    client.files.get.return_value = MagicMock()
    mock_response = MagicMock()
    mock_response.text = response_text
    client.models.generate_content.return_value = mock_response
    return client


class TestParseResumePDF:
    def test_parse_pdf_success(self, parser, tmp_path):
        fake_pdf = tmp_path / "resume.pdf"
        fake_pdf.write_bytes(b"fake")
        parser.llm_client.client = make_mock_client()

        with patch.object(parser, "_parse_pdf", return_value=RESUME_TEXT_WITH_SECTIONS):
            result = parser.parse_resume(str(fake_pdf))

        assert isinstance(result, dict)
        assert "header" in result
        assert "experience" in result

    def test_parse_pdf_uploads_and_deletes_file(self, parser, tmp_path):
        fake_pdf = tmp_path / "resume.pdf"
        fake_pdf.write_bytes(b"fake")
        parser.llm_client.client = make_mock_client()

        with patch.object(parser, "_parse_pdf", return_value=RESUME_TEXT_WITH_SECTIONS):
            parser.parse_resume(str(fake_pdf))

        parser.llm_client.client.files.upload.assert_called_once()
        parser.llm_client.client.files.delete.assert_called_once()

    def test_parse_pdf_invalid_json_response_raises(self, parser, tmp_path):
        fake_pdf = tmp_path / "resume.pdf"
        fake_pdf.write_bytes(b"fake")
        parser.client = make_mock_client(response_text="not valid json {{")

        with patch.object(parser, "_parse_pdf", return_value=RESUME_TEXT_WITH_SECTIONS):
            with pytest.raises(Exception):
                parser.parse_resume(str(fake_pdf))


class TestParseResumeDOCX:
    def test_parse_docx_success(self, parser, tmp_path):
        fake_docx = tmp_path / "resume.docx"
        fake_docx.write_bytes(b"fake")
        parser.llm_client.client = make_mock_client()

        with patch.object(parser, "_parse_docx", return_value=RESUME_TEXT_WITH_SECTIONS):
            result = parser.parse_resume(str(fake_docx))

        assert isinstance(result, dict)
        assert "header" in result

    def test_parse_docx_does_not_upload_file(self, parser, tmp_path):
        fake_docx = tmp_path / "resume.docx"
        fake_docx.write_bytes(b"fake")
        parser.llm_client.client = make_mock_client()

        with patch.object(parser, "_parse_docx", return_value=RESUME_TEXT_WITH_SECTIONS):
            parser.parse_resume(str(fake_docx))

        parser.llm_client.client.files.upload.assert_not_called()


class TestParseResumeValidation:
    def test_unsupported_extension_raises_value_error(self, parser, tmp_path):
        fake_file = tmp_path / "resume.txt"
        fake_file.write_text("some text")

        with pytest.raises(ValueError, match="Unsupported file format"):
            parser.parse_resume(str(fake_file))

    def test_text_over_max_words_raises_value_error(self, parser, tmp_path):
        fake_pdf = tmp_path / "resume.pdf"
        fake_pdf.write_bytes(b"fake")

        with patch.object(parser, "_parse_pdf", return_value=" ".join(["word"] * 1600)):
            with pytest.raises(ValueError):
                parser.parse_resume(str(fake_pdf))

    def test_no_sections_raises_value_error(self, parser, tmp_path):
        fake_pdf = tmp_path / "resume.pdf"
        fake_pdf.write_bytes(b"fake")

        with patch.object(parser, "_parse_pdf", return_value="random text without any resume headers"):
            with pytest.raises(ValueError, match="Please upload a valid resume"):
                parser.parse_resume(str(fake_pdf))
