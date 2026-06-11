"""
test_common_routes.py — Tests for public/health-check endpoints.
Routes covered:
  GET  /          → root welcome
  GET  /health    → health check
"""
import pytest
from fastapi.testclient import TestClient


class TestRootEndpoint:
    def test_root_returns_200(self, client: TestClient):
        resp = client.get("/")
        assert resp.status_code == 200

    def test_root_returns_welcome_message(self, client: TestClient):
        data = resp = client.get("/")
        assert "message" in resp.json()


class TestHealthCheck:
    def test_health_returns_200(self, client: TestClient):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_status_ok(self, client: TestClient):
        resp = client.get("/health")
        assert resp.json()["status"] == "ok"

    def test_health_has_message(self, client: TestClient):
        resp = client.get("/health")
        assert "message" in resp.json()
