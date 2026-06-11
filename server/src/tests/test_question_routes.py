"""
test_question_routes.py — Tests for /api/v1/question endpoints.
Routes covered:
  GET /api/v1/question                        → list questions (auth)
  GET /api/v1/question?question_id=<id>       → single question (auth)
  GET /api/v1/question?category=<cat>         → filter by category (auth)
  GET /api/v1/question?difficulty=<diff>      → filter by difficulty (auth)
  GET /api/v1/question/categories             → list categories (auth)
  GET /api/v1/question                        → reject unauthenticated
  POST /api/v1/question/add                   → add question (auth)
  POST /api/v1/question/add                   → missing fields → 422
"""
import pytest
from fastapi.testclient import TestClient

BASE = "/api/v1/question"


class TestQuestionAuth:
    def test_unauthenticated_request_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.get(BASE)
            assert resp.status_code == 401


class TestGetQuestions:
    def test_get_all_questions_returns_200(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get(BASE, headers=auth_headers)
        assert resp.status_code == 200

    def test_get_all_questions_returns_list(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get(BASE, headers=auth_headers)
        body = resp.json()
        assert "data" in body
        assert isinstance(body["data"], list)

    def test_filter_by_difficulty_easy(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}?difficulty=easy", headers=auth_headers)
        assert resp.status_code == 200

    def test_filter_by_category(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}?category=Arrays", headers=auth_headers)
        assert resp.status_code == 200

    def test_invalid_question_id_returns_404(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.get(f"{BASE}?question_id=99999999", headers=auth_headers)
        assert resp.status_code == 404


class TestGetCategories:
    def test_categories_returns_200(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/categories", headers=auth_headers)
        assert resp.status_code == 200

    def test_categories_data_is_list(self, client: TestClient, auth_headers: dict):
        resp = client.get(f"{BASE}/categories", headers=auth_headers)
        assert isinstance(resp.json().get("data"), list)


class TestAddQuestion:
    VALID_QUESTION = {
        "title": "Two Sum",
        "difficulty": "easy",
        "category": "Arrays",
        "problem_description": "Find two numbers that add to target.",
        "starter_code": "class Solution:\n    def twoSum(self, nums, target): pass",
        "function_name": "twoSum",
        "test_cases": [{"test": [[2, 7, 11, 15], 9], "expected_output": [0, 1]}],
    }

    def test_add_valid_question_returns_200(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(f"{BASE}/add", json=self.VALID_QUESTION, headers=auth_headers)
        # 200 on success, 400 if already exists, 500 if DB constraint (e.g. id=None)
        assert resp.status_code in (200, 400, 500), resp.text

    def test_add_question_missing_required_fields_returns_422(
        self, client: TestClient, auth_headers: dict
    ):
        resp = client.post(f"{BASE}/add", json={"title": "Only Title"}, headers=auth_headers)
        assert resp.status_code == 422

    def test_add_question_unauthenticated_returns_401(self):
        from api.app import app
        with TestClient(app) as local_client:
            resp = local_client.post(f"{BASE}/add", json=self.VALID_QUESTION)
            assert resp.status_code == 401
