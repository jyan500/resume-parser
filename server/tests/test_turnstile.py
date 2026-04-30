from unittest.mock import patch, MagicMock
from utils.routes import TAILOR_RESUME_URL, MISSING_KEYWORDS_URL


class TestVerifyTurnstile:
    def test_returns_true_on_cloudflare_success(self):
        from utils.turnstile import _verify_turnstile
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": True}
        with patch("utils.turnstile.requests.post", return_value=mock_resp):
            assert _verify_turnstile("valid-token", "1.2.3.4") is True

    def test_returns_false_on_cloudflare_failure(self):
        from utils.turnstile import _verify_turnstile
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": False, "error-codes": ["invalid-input-response"]}
        with patch("utils.turnstile.requests.post", return_value=mock_resp):
            assert _verify_turnstile("bad-token", "1.2.3.4") is False


class TestRequireTurnstile:
    def test_bypasses_when_no_secret_key(self, client):
        # TURNSTILE_SECRET_KEY is unset in conftest — decorator passes through
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_missing_token_returns_403(self, client, monkeypatch):
        monkeypatch.setenv("TURNSTILE_SECRET_KEY", "test-secret")
        resp = client.post(TAILOR_RESUME_URL, json={})
        assert resp.status_code == 403
        assert "errors" in resp.get_json()

    def test_dev_bypass_token_returns_403(self, client, monkeypatch):
        monkeypatch.setenv("TURNSTILE_SECRET_KEY", "test-secret")
        resp = client.post(TAILOR_RESUME_URL, json={}, headers={"X-Turnstile-Token": "dev-bypass"})
        assert resp.status_code == 403

    def test_invalid_token_returns_403(self, client, monkeypatch):
        monkeypatch.setenv("TURNSTILE_SECRET_KEY", "test-secret")
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": False}
        with patch("utils.turnstile.requests.post", return_value=mock_resp):
            resp = client.post(
                TAILOR_RESUME_URL,
                json={},
                headers={"X-Turnstile-Token": "bad-token"},
            )
        assert resp.status_code == 403

    def test_valid_token_passes_turnstile(self, client, monkeypatch, sample_resume_json, sample_job):
        monkeypatch.setenv("TURNSTILE_SECRET_KEY", "test-secret")
        mock_cf = MagicMock()
        mock_cf.json.return_value = {"success": True}
        with patch("utils.turnstile.requests.post", return_value=mock_cf), \
             patch("app.keyword_extractor.get_missing_keywords", return_value=[]):
            resp = client.post(
                MISSING_KEYWORDS_URL,
                json={
                    "resume": sample_resume_json,
                    "jobTitle": sample_job["jobTitle"],
                    "jobDescription": sample_job["jobDescription"],
                },
                headers={"X-Turnstile-Token": "valid-token"},
            )
        assert resp.status_code == 200
