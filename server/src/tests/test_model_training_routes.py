"""
test_model_training_routes.py — Tests for /api/v1/modelTraining endpoints.
Routes covered:
  GET  /api/v1/modelTraining/available_attributes  → list model configs (auth)
  GET  /api/v1/modelTraining/available_attributes  → reject unauthenticated
  POST /api/v1/modelTraining/train                 → valid payload triggers training (auth)
  POST /api/v1/modelTraining/train                 → missing fields returns 422
  POST /api/v1/modelTraining/train                 → reject unauthenticated
"""
import pytest
from fastapi.testclient import TestClient

BASE = "/api/v1/modelTraining"

VALID_TRAIN_PAYLOAD = {
    "model_name": "LinearRegression",
    "model_params": {"fit_intercept": True},
    "type": "regression",
    "make_dataset": {"n_samples": 50, "n_features": 2, "noise": 0.1},
}


class TestModelTrainingAuth:
    def test_attributes_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(f"{BASE}/available_attributes")
            assert resp.status_code == 401

    def test_train_without_token_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.post(f"{BASE}/train", json=VALID_TRAIN_PAYLOAD)
            assert resp.status_code == 401


class TestAvailableAttributes:
    def test_attributes_returns_200(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/available_attributes", headers=auth_headers)
        assert resp.status_code == 200

    def test_attributes_contains_regression_models(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get(f"{BASE}/available_attributes", headers=auth_headers)
        body = resp.json()
        assert "data" in body
        assert "regression_models" in body["data"]

    def test_attributes_contains_classification_models(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get(f"{BASE}/available_attributes", headers=auth_headers)
        body = resp.json()
        assert "classification_models" in body["data"]


class TestTrain:
    def test_train_missing_fields_returns_422(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(f"{BASE}/train", json={"model_name": "Only Name"}, headers=auth_headers)
        assert resp.status_code == 422

    def test_train_empty_body_returns_422(self, client: TestClient, auth_headers: dict):
        resp = client.post(f"{BASE}/train", json={}, headers=auth_headers)
        assert resp.status_code == 422

    def test_train_valid_payload_returns_200_or_500(
        self, client: TestClient, auth_headers: dict
    ):
        """
        200 if MLflow is reachable in the test environment,
        500 if MLflow is unavailable (expected in CI without credentials).
        Either way the endpoint must respond — not hang.
        """
        resp = client.post(
            f"{BASE}/train", json=VALID_TRAIN_PAYLOAD, headers=auth_headers, timeout=30
        )
        assert resp.status_code in (200, 500), resp.text

    def test_train_invalid_model_name_returns_error(
        self, client: TestClient, auth_headers: dict
    ):
        payload = {**VALID_TRAIN_PAYLOAD, "model_name": "NonExistentModel9999"}
        resp = client.post(f"{BASE}/train", json=payload, headers=auth_headers, timeout=30)
        assert resp.status_code in (400, 422, 500), resp.text
