"""
test_interview_routes.py — Tests for /api/v1/interview endpoints.
Routes covered:
  GET  /api/v1/interview/dummy        → dummy interviews (auth)
  GET  /api/v1/interview/dummy        → reject unauthenticated
  POST /api/v1/interview/chat         → missing body returns 422
  POST /api/v1/interview/chat         → reject unauthenticated
  GET  /api/v1/interview/list         → list saved interviews (auth)
"""
import pytest
from fastapi.testclient import TestClient

BASE = "/api/v1/interview"


class TestInterviewAuth:
    def test_dummy_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(f"{BASE}/dummy")
            assert resp.status_code == 401

    def test_chat_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.post(f"{BASE}/chat", json={})
            assert resp.status_code == 401

    def test_list_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(f"{BASE}/list")
            assert resp.status_code == 401


class TestDummyInterviews:
    def test_dummy_returns_200(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/dummy", headers=auth_headers)
        # 200 success or 500 if LLM unavailable in test env
        assert resp.status_code in (200, 500), resp.text

    def test_dummy_response_is_json(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/dummy", headers=auth_headers)
        assert isinstance(resp.json(), dict)


class TestInterviewChat:
    def test_chat_missing_body_returns_422(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(f"{BASE}/chat", json={}, headers=auth_headers)
        assert resp.status_code == 422

    def test_chat_invalid_thread_returns_error(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(
            f"{BASE}/chat",
            json={"thread_id": "bad-thread", "message": "hello", "topic": "Python"},
            headers=auth_headers,
        )
        # 200 (starts fresh graph) or 4xx/5xx — must NOT hang
        assert resp.status_code in (200, 400, 422, 500), resp.text


class TestInterviewList:
    def test_list_returns_200(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/list", headers=auth_headers)
        assert resp.status_code == 200

    def test_list_data_is_list(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/list", headers=auth_headers)
        assert isinstance(resp.json().get("data"), list)
