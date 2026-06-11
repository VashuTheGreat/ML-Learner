"""
test_coding_routes.py — Tests for /api/v1/coding endpoints.
Routes covered:
  GET  /api/v1/coding/fetch           → fetch coding schema (auth)
  GET  /api/v1/coding/fetch           → reject unauthenticated
  POST /api/v1/coding/run_code        → missing body returns 422
  POST /api/v1/coding/run_code        → reject unauthenticated
"""
import pytest
from fastapi.testclient import TestClient

BASE = "/api/v1/coding"


class TestCodingAuth:
    def test_fetch_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(f"{BASE}/fetch")
            assert resp.status_code == 401

    def test_run_code_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.post(f"{BASE}/run_code", json={})
            assert resp.status_code == 401


class TestFetchCodingSchema:
    def test_fetch_with_token_returns_200_or_creates_schema(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get(f"{BASE}/fetch", headers=auth_headers)
        # 200 if schema exists or was just created
        assert resp.status_code == 200

    def test_fetch_returns_valid_json(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/fetch", headers=auth_headers)
        assert isinstance(resp.json(), dict)


class TestRunCode:
    def test_run_code_missing_fields_returns_422(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(f"{BASE}/run_code", json={}, headers=auth_headers)
        assert resp.status_code == 422

    def test_run_code_invalid_question_id_returns_error(
        self, client: TestClient, auth_headers: dict
    ):
        payload = {
            "question_id": 99999999,
            "code": "class Solution:\n    def solve(self): pass",
            "language": "python",
        }
        resp = client.post(f"{BASE}/run_code", json=payload, headers=auth_headers)
        # 404 (question not found) or 500 if internal, but NOT 200
        assert resp.status_code in (400, 404, 500), resp.text
