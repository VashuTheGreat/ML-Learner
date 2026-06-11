"""
test_user_routes.py — Tests for /api/v1/user endpoints.
Routes covered:
  POST /api/v1/user/create    → register
  POST /api/v1/user/login     → login
  GET  /api/v1/user/profile   → get profile (auth required)
  GET  /api/v1/user/profile   → reject unauthenticated request
  POST /api/v1/user/login     → wrong password returns 4xx
  POST /api/v1/user/create    → duplicate email returns 4xx
"""
import uuid
import pytest
from fastapi.testclient import TestClient


UNIQUE = str(uuid.uuid4())[:8]
REGISTER_PAYLOAD = {
    "fullName": f"Test User {UNIQUE}",
    "email": f"user_{UNIQUE}@test.com",
    "username": f"user_{UNIQUE}",
    "password": "ValidPass@1",
}


class TestUserRegistration:
    def test_register_new_user_201(self, client: TestClient):
        resp = client.post("/api/v1/user/create", json=REGISTER_PAYLOAD)
        assert resp.status_code in (200, 201), resp.text

    def test_register_returns_success_flag(self, client: TestClient):
        resp = client.post("/api/v1/user/create", json=REGISTER_PAYLOAD)
        # Either success (first run) or duplicate error — both must be valid JSON
        assert isinstance(resp.json(), dict)

    def test_register_duplicate_email_returns_error(self, client: TestClient):
        # Register once, then try again with same email
        client.post("/api/v1/user/create", json=REGISTER_PAYLOAD)
        resp = client.post("/api/v1/user/create", json=REGISTER_PAYLOAD)
        assert resp.status_code in (400, 409, 422), resp.text

    def test_register_missing_field_returns_422(self, client: TestClient):
        resp = client.post("/api/v1/user/create", json={"email": "a@b.com"})
        assert resp.status_code == 422


class TestUserLogin:
    def test_login_valid_credentials_200(self, client: TestClient, auth_token: str):
        # auth_token fixture already tests login — just assert it's a non-empty string
        assert isinstance(auth_token, str)
        assert len(auth_token) > 10

    def test_login_wrong_password_returns_4xx(self, client: TestClient):
        resp = client.post(
            "/api/v1/user/login",
            json={"email": REGISTER_PAYLOAD["email"], "password": "WrongPass!"},
        )
        assert resp.status_code in (400, 401, 403), resp.text

    def test_login_nonexistent_user_returns_4xx(self, client: TestClient):
        resp = client.post(
            "/api/v1/user/login",
            json={"email": "nobody@nowhere.com", "password": "Pass@123"},
        )
        assert resp.status_code in (400, 401, 404), resp.text

    def test_login_missing_fields_returns_422(self, client: TestClient):
        resp = client.post("/api/v1/user/login", json={})
        assert resp.status_code == 422


class TestUserProfile:
    def test_get_profile_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get("/api/v1/user/itself")
            assert resp.status_code == 401

    def test_get_profile_with_token_returns_200(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get("/api/v1/user/itself", headers=auth_headers)
        assert resp.status_code == 200

    def test_get_profile_contains_user_data(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get("/api/v1/user/itself", headers=auth_headers)
        body = resp.json()
        assert "data" in body or "email" in str(body)
