import pytest
from unittest.mock import MagicMock

from utils.keywords import KeywordExtractor, _collect_bullet_text, _collect_skill_strings
from utils.schemas.tailor_resume_schema import Keyword, SkillType


def make_keyword(text, kw_type="Technical"):
    return Keyword(type=SkillType(kw_type), text=text)


RESUME_WITH_BULLETS = {
    "experience": [
        {
            "bullets": [
                {"id": "b1", "text": "Developed web applications using Node.js and PostgreSQL."},
                {"id": "b2", "text": "Deployed services with Docker and automated CI/CD pipelines."},
            ]
        }
    ],
    "projects": [
        {
            "bullets": [
                {"id": "p1", "text": "Built a CLI tool in Python for data processing."}
            ]
        }
    ],
    "skills": [
        {"category": "Backend", "skills": ["Node.js", "PostgreSQL"]},
        {"category": "DevOps", "skills": ["Kubernetes"]},
    ],
}


class TestCollectBulletText:
    def test_collects_from_experience_bullets(self):
        text = _collect_bullet_text(RESUME_WITH_BULLETS)
        assert "Node.js" in text
        assert "Docker" in text

    def test_collects_from_project_bullets(self):
        text = _collect_bullet_text(RESUME_WITH_BULLETS)
        assert "Python" in text

    def test_empty_resume_returns_empty_string(self):
        text = _collect_bullet_text({})
        assert text == ""

    def test_handles_plain_string_bullets(self):
        resume = {"experience": [{"bullets": ["Built APIs.", "Wrote tests."]}], "projects": []}
        text = _collect_bullet_text(resume)
        assert "Built APIs." in text


class TestCollectSkillStrings:
    def test_collects_skills_from_categories(self):
        skills = _collect_skill_strings(RESUME_WITH_BULLETS)
        assert "Node.js" in skills
        assert "Kubernetes" in skills

    def test_empty_skills_returns_empty_list(self):
        skills = _collect_skill_strings({})
        assert skills == []


class TestComputeMissing:
    def test_keyword_in_bullets_not_missing(self, keyword_extractor):
        keywords = [make_keyword("Node.js")]
        result = keyword_extractor.compute_missing(keywords, RESUME_WITH_BULLETS)
        texts = [k["text"] for k in result]
        assert "Node.js" not in texts

    def test_keyword_absent_entirely_is_missing(self, keyword_extractor):
        keywords = [make_keyword("React")]
        result = keyword_extractor.compute_missing(keywords, RESUME_WITH_BULLETS)
        assert len(result) == 1
        assert result[0]["text"] == "React"
        assert result[0]["in_skills_only"] is False

    def test_keyword_in_skills_only(self, keyword_extractor):
        # Kubernetes is in skills but not in bullet text
        keywords = [make_keyword("Kubernetes")]
        result = keyword_extractor.compute_missing(keywords, RESUME_WITH_BULLETS)
        assert len(result) == 1
        assert result[0]["text"] == "Kubernetes"
        assert result[0]["in_skills_only"] is True

    def test_case_insensitive_matching(self, keyword_extractor):
        # "postgresql" (lowercase) should match "PostgreSQL" in bullets
        keywords = [make_keyword("postgresql")]
        result = keyword_extractor.compute_missing(keywords, RESUME_WITH_BULLETS)
        texts = [k["text"] for k in result]
        assert "postgresql" not in texts

    def test_word_boundary_sql_does_not_match_nosql(self, keyword_extractor):
        resume = {
            "experience": [{"bullets": [{"id": "b1", "text": "Used NoSQL databases like MongoDB."}]}],
            "projects": [],
            "skills": [],
        }
        keywords = [make_keyword("SQL")]
        result = keyword_extractor.compute_missing(keywords, resume)
        # "SQL" should not match "NoSQL" due to word boundary
        assert len(result) == 1
        assert result[0]["text"] == "SQL"

    def test_empty_keyword_text_skipped(self, keyword_extractor):
        keywords = [make_keyword("   ")]  # whitespace-only
        result = keyword_extractor.compute_missing(keywords, RESUME_WITH_BULLETS)
        assert len(result) == 0

    def test_empty_resume_all_keywords_missing(self, keyword_extractor):
        keywords = [make_keyword("React"), make_keyword("TypeScript")]
        result = keyword_extractor.compute_missing(keywords, {})
        assert len(result) == 2
        for item in result:
            assert item["in_skills_only"] is False

    def test_soft_skill_type_preserved(self, keyword_extractor):
        keywords = [make_keyword("Leadership", "Soft Skill")]
        result = keyword_extractor.compute_missing(keywords, {})
        assert result[0]["type"] == "Soft Skill"


class TestGetMissingKeywordsLLM:
    def test_happy_path_returns_list(self, keyword_extractor):
        mock_keywords = [make_keyword("React"), make_keyword("TypeScript")]
        keyword_extractor.client.generate_response = MagicMock(
            return_value=MagicMock(keywords=mock_keywords)
        )
        result = keyword_extractor.get_missing_keywords("Frontend Engineer", "job desc", {})
        assert isinstance(result, list)

    def test_extract_exception_propagates_with_message(self, keyword_extractor):
        keyword_extractor.client.generate_response = MagicMock(side_effect=Exception("LLM error"))
        with pytest.raises(Exception, match="Something went wrong while extracting keywords"):
            keyword_extractor.get_missing_keywords("Frontend Engineer", "job desc", {})
