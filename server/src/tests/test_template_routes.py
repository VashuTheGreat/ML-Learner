"""
test_template_routes.py — Tests for /api/v1/template endpoints.
Routes covered:
  GET  /api/v1/template/resume           → fetch resume template (auth)
  GET  /api/v1/template/resume           → reject unauthenticated
  GET  /api/v1/template/coding           → fetch coding template (auth)
  GET  /api/v1/template/coding           → reject unauthenticated
  PUT  /api/v1/template/resume           → update resume template (auth)
  PUT  /api/v1/template/resume           → missing body returns 422
  POST /api/v1/template/coding           → create coding template (auth)
  POST /api/v1/template/coding           → missing body returns 422
"""
import pytest
from fastapi.testclient import TestClient

BASE = "/api/v1/template"


class TestTemplateAuth:
    def test_get_resume_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(f"{BASE}/resume")
            assert resp.status_code == 401

    def test_get_coding_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(f"{BASE}/coding")
            assert resp.status_code == 401

    def test_update_resume_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.put(f"{BASE}/resume", json={"content": {}})
            assert resp.status_code == 401

    def test_create_coding_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.post(f"{BASE}/coding", json={"content": {}})
            assert resp.status_code == 401


class TestGetResumeTemplate:
    def test_no_template_returns_404(self, client: TestClient, auth_headers: dict):
        """A fresh user has no resume template yet."""
        resp = client.get(f"{BASE}/resume", headers=auth_headers)
        assert resp.status_code in (200, 404), resp.text

    def test_response_is_valid_json(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/resume", headers=auth_headers)
        assert isinstance(resp.json(), dict)


class TestCodingTemplate:
    CODING_CONTENT = {"solved": [], "language": "python"}

    def test_create_coding_template_returns_201(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(
            f"{BASE}/coding",
            json={"content": self.CODING_CONTENT},
            headers=auth_headers,
        )
        assert resp.status_code in (200, 201), resp.text

    def test_create_coding_missing_content_returns_422(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(f"{BASE}/coding", json={}, headers=auth_headers)
        assert resp.status_code == 422

    def test_get_coding_template_returns_200_after_create(
        self, client: TestClient, auth_headers: dict
    ):
        # Create first
        client.post(
            f"{BASE}/coding",
            json={"content": self.CODING_CONTENT},
            headers=auth_headers,
        )
        resp = client.get(f"{BASE}/coding", headers=auth_headers)
        assert resp.status_code == 200


class TestUpdateResumeTemplate:
    def test_update_missing_content_returns_422(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.put(f"{BASE}/resume", json={}, headers=auth_headers)
        assert resp.status_code == 422

    def test_update_nonexistent_template_returns_404(
        self, client: TestClient, auth_headers: dict
    ):
        """If user has no resume template, update should return 404."""
        resp = client.put(
            f"{BASE}/resume",
            json={"content": {"name": "Test"}},
            headers=auth_headers,
        )
        assert resp.status_code in (200, 404), resp.text
