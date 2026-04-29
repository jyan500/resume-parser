import json
import os
from pathlib import Path

# Set fake API keys before any app imports so constructors don't fail.
# These only take effect if the real keys aren't already in the environment.
os.environ.setdefault("GOOGLE_API_KEY", "fake-key-for-testing")
os.environ.setdefault("GEMINI_API_KEY", "fake-key-for-testing")
os.environ.setdefault("OPENAI_API_KEY", "fake-key-for-testing")
os.environ.setdefault("OPENROUTER_API_KEY", "fake-key-for-testing")
os.environ.setdefault("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

import pytest

TESTS_DIR = Path(__file__).parent
FIXTURES_DIR = TESTS_DIR / "fixtures"


@pytest.fixture(scope="session")
def app():
    import app as flask_app_module
    flask_app_module.app.config["TESTING"] = True
    return flask_app_module.app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def parser():
    from utils.parser import ResumeParser
    return ResumeParser()


@pytest.fixture()
def tailor():
    from utils.tailor import TailorResume
    return TailorResume()


@pytest.fixture()
def keyword_extractor():
    from utils.keywords import KeywordExtractor
    return KeywordExtractor()


@pytest.fixture(scope="session")
def sample_resume_json():
    with open(FIXTURES_DIR / "sample_resume.json") as f:
        return json.load(f)


@pytest.fixture(scope="session")
def sample_job():
    with open(FIXTURES_DIR / "sample_job.json") as f:
        return json.load(f)
