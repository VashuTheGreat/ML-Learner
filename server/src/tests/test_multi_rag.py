"""
API Endpoint Tests — Multi-Rag
================================
Tests every FastAPI route using TestClient (no real server needed).
LLM / graph calls are mocked — zero Groq token usage.

Run with:
    uv run pytest src/tests/test_api_pytest.py -v -s
"""

import os
import io
import sys
import uuid
import shutil
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.getcwd())

from dotenv import load_dotenv
load_dotenv()

import logger  # noqa: F401 — sets up rotating handler
from api.app import app
from src.constants import PUBLIC_FOLDER_FILE_PATH, ARTIFACT_DIR


# ─────────────────────────────────────────────────────────────
#  Fixtures
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    """Returns a fresh TestClient for each test to avoid cookie state leakage."""
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def thread_id():
    """Generates a unique thread ID for the test and cleans up directories afterwards."""
    tid = f"pytest-api-test-{uuid.uuid4()}"
    yield tid

    # Cleanup folders created for this thread
    pub_path = os.path.join(PUBLIC_FOLDER_FILE_PATH, tid)
    art_path = os.path.join(ARTIFACT_DIR, tid)
    if os.path.exists(pub_path):
        shutil.rmtree(pub_path, ignore_errors=True)
    if os.path.exists(art_path):
        shutil.rmtree(art_path, ignore_errors=True)


@pytest.fixture
def auth_cookies(thread_id):
    """Cookie dict containing the active test thread ID."""
    return {"thread_id": thread_id}


@pytest.fixture(autouse=True)
def mock_delete_thread():
    """Mock delete_thread to prevent sleep and disk cleanup during tests."""
    with patch("api.routes.multi_rag_routes.delete_thread", new_callable=AsyncMock) as mock:
        yield mock


# ─────────────────────────────────────────────────────────────
#  1. Auth Middleware Tests
# ─────────────────────────────────────────────────────────────

class TestAuthMiddleware:

    def test_no_cookie_on_protected_route_returns_401(self, client):
        """Any /api/v1/multi_rag/* route without a cookie must return 401."""
        resp = client.get("/api/v1/multi_rag/ingest")
        print(f"\n[AUTH] No-cookie ingest status: {resp.status_code}, body: {resp.json()}")
        assert resp.status_code == 401
        assert "error" in resp.json() or "detail" in resp.json()

    def test_no_cookie_on_chat_returns_401(self, client):
        resp = client.post("/api/v1/multi_rag/chat", json={"message": "hello"})
        print(f"[AUTH] No-cookie chat status: {resp.status_code}")
        assert resp.status_code == 401

    def test_no_cookie_on_upload_returns_401(self, client):
        resp = client.post("/api/v1/multi_rag/upload")
        print(f"[AUTH] No-cookie upload status: {resp.status_code}")
        assert resp.status_code == 401

    def test_login_endpoint_is_public(self, client):
        """Login must NOT require a cookie."""
        resp = client.get("/api/v1/multi_rag/initiate/3600")
        print(f"[AUTH] Login status: {resp.status_code}")
        assert resp.status_code == 200

    def test_frontend_pages_are_public(self, client):
        """Frontend HTML pages must be accessible without cookies."""
        resp = client.get("/")
        print(f"[AUTH] Home page status: {resp.status_code}")
        assert resp.status_code == 200


# ─────────────────────────────────────────────────────────────
#  2. User / Session Router Tests
# ─────────────────────────────────────────────────────────────

class TestUserRouter:

    def test_login_returns_200(self, client):
        resp = client.get("/api/v1/multi_rag/initiate/3600")
        print(f"\n[USER] Login resp: {resp.json()}")
        assert resp.status_code == 200

    def test_login_returns_thread_id(self, client):
        resp = client.get("/api/v1/multi_rag/initiate/3600")
        body = resp.json()
        print(f"[USER] Login body: {body}")
        assert "data" in body and "thread_id" in body["data"]
        assert len(body["data"]["thread_id"]) > 0

    def test_login_sets_cookie(self, client):
        resp = client.get("/api/v1/multi_rag/initiate/3600")
        print(f"[USER] Cookies: {resp.cookies}")
        assert "thread_id" in resp.cookies

    def test_login_cookie_value_matches_body_thread_id(self, client):
        resp = client.get("/api/v1/multi_rag/initiate/3600")
        assert resp.cookies.get("thread_id") == resp.json().get("data", {}).get("thread_id")

    def test_login_with_zero_seconds(self, client):
        """Login with 0 session length should still succeed."""
        resp = client.get("/api/v1/multi_rag/initiate/0")
        print(f"[USER] Login/0 status: {resp.status_code}")
        assert resp.status_code == 200


# ─────────────────────────────────────────────────────────────
#  3. Upload Router Tests
# ─────────────────────────────────────────────────────────────

class TestUploadRouter:

    def test_upload_txt_file_returns_200(self, client, auth_cookies, tmp_path):
        txt = tmp_path / "test.txt"
        txt.write_text("Hello this is a test file.")

        with open(txt, "rb") as f:
            resp = client.post(
                "/api/v1/multi_rag/upload",
                files={"file": ("test.txt", f, "text/plain")},
                cookies=auth_cookies,
            )

        print(f"\n[UPLOAD] TXT upload status: {resp.status_code}, body: {resp.json()}")
        assert resp.status_code == 200
        assert resp.json().get("message") == "File uploaded successfully"

    def test_upload_returns_filename_and_thread_id(self, client, thread_id, auth_cookies, tmp_path):
        txt = tmp_path / "sample.txt"
        txt.write_text("Sample content.")

        with open(txt, "rb") as f:
            resp = client.post(
                "/api/v1/multi_rag/upload",
                files={"file": ("sample.txt", f, "text/plain")},
                cookies=auth_cookies,
            )

        body = resp.json()
        print(f"[UPLOAD] Body: {body}")
        assert "data" in body
        assert "filename" in body["data"]
        assert "thread_id" in body["data"]
        assert body["data"]["thread_id"] == thread_id

    def test_upload_pdf_file_returns_200(self, client, auth_cookies, tmp_path):
        pdf = tmp_path / "report.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake pdf content")

        with open(pdf, "rb") as f:
            resp = client.post(
                "/api/v1/multi_rag/upload",
                files={"file": ("report.pdf", f, "application/pdf")},
                cookies=auth_cookies,
            )

        print(f"[UPLOAD] PDF upload status: {resp.status_code}")
        assert resp.status_code == 200

    def test_upload_creates_file_on_disk(self, client, thread_id, auth_cookies, tmp_path):
        txt = tmp_path / "disk_test.txt"
        txt.write_text("Disk test.")

        with open(txt, "rb") as f:
            resp = client.post(
                "/api/v1/multi_rag/upload",
                files={"file": ("disk_test.txt", f, "text/plain")},
                cookies=auth_cookies,
            )

        filename = resp.json().get("data", {}).get("filename", "")
        print(f"[UPLOAD] Checking disk for: {filename}")
        expected_path = os.path.join(PUBLIC_FOLDER_FILE_PATH, thread_id, filename)
        assert os.path.exists(expected_path), f"File not found on disk: {expected_path}"

    def test_upload_without_auth_returns_401(self, client, tmp_path):
        txt = tmp_path / "noauth.txt"
        txt.write_text("No auth test.")

        with open(txt, "rb") as f:
            resp = client.post(
                "/api/v1/multi_rag/upload",
                files={"file": ("noauth.txt", f, "text/plain")},
            )

        print(f"[UPLOAD] No-auth status: {resp.status_code}")
        assert resp.status_code == 401


# ─────────────────────────────────────────────────────────────
#  4. Ingest Router Tests  (graph mocked — no LLM calls)
# ─────────────────────────────────────────────────────────────

class TestIngestRouter:

    def test_ingest_with_no_files_returns_404_or_400(self, client, auth_cookies):
        """Thread that has no uploaded files should fail gracefully."""
        resp = client.get("/api/v1/multi_rag/ingest", cookies=auth_cookies)
        print(f"\n[INGEST] No-files status: {resp.status_code}, body: {resp.json()}")
        assert resp.status_code in (400, 404)
        assert "error" in resp.json() or "detail" in resp.json()

    @patch("api.routes.multi_rag_routes.VectiorizerPipeline")
    def test_ingest_with_files_triggers_pipeline(self, mock_pipeline_cls, client, thread_id, auth_cookies, tmp_path):
        """If files exist, the vectorizer pipeline must be called."""
        user_folder = os.path.join(PUBLIC_FOLDER_FILE_PATH, thread_id)
        os.makedirs(user_folder, exist_ok=True)
        fake_file = os.path.join(user_folder, "fake.txt")
        with open(fake_file, "w") as fh:
            fh.write("fake content")

        fake_artifact = MagicMock()
        fake_artifact.vector_store_path = f"artifacts/{thread_id}/transformation/fake"
        fake_result = MagicMock()
        fake_result.data_transformation_artifacts = [fake_artifact]

        mock_instance = MagicMock()
        mock_instance.initiate = AsyncMock(return_value=fake_result)
        mock_pipeline_cls.return_value = mock_instance

        with patch("api.routes.multi_rag_routes.Retreiver") as mock_retreiver_cls:
            mock_retreiver = MagicMock()
            mock_retreiver.get_all_documents = AsyncMock(return_value=[
                {"page_content": "test doc", "metadata": {}}
            ])
            mock_retreiver_cls.return_value = mock_retreiver

            resp = client.get("/api/v1/multi_rag/ingest", cookies=auth_cookies)

        print(f"[INGEST] Pipeline mock status: {resp.status_code}, body: {resp.json()}")
        assert resp.status_code == 200
        assert "message" in resp.json()
        assert mock_instance.initiate.called


# ─────────────────────────────────────────────────────────────
#  5. Chat Router Tests  (graph mocked — zero token usage)
# ─────────────────────────────────────────────────────────────

class TestChatRouter:

    def test_chat_without_artifact_dir_returns_400(self, client, auth_cookies):
        """Chat must fail with 400 if user hasn't ingested data yet."""
        resp = client.post(
            "/api/v1/multi_rag/chat",
            json={"message": "Hello"},
            cookies=auth_cookies,
        )
        print(f"\n[CHAT] No-artifact status: {resp.status_code}, body: {resp.json()}")
        assert resp.status_code == 400
        assert "error" in resp.json() or "detail" in resp.json()

    def test_chat_without_auth_returns_401(self, client):
        resp = client.post("/api/v1/multi_rag/chat", json={"message": "Hello"})
        print(f"[CHAT] No-auth status: {resp.status_code}")
        assert resp.status_code == 401

    @patch("api.routes.multi_rag_routes.graph")
    def test_chat_with_valid_state_returns_200(self, mock_graph, client, thread_id, auth_cookies):
        """Chat must return 200 + ai_response stream when artifacts exist."""
        artifact_dir = f"artifacts/{thread_id}/transformation/fake_store"
        os.makedirs(artifact_dir, exist_ok=True)

        async def mock_astream_events(*args, **kwargs):
            yield {
                "event": "on_chat_model_stream",
                "tags": ["chat_token"],
                "data": {
                    "chunk": MagicMock(content="This is a mocked AI response.")
                }
            }
            yield {
                "event": "on_chain_end",
                "name": "LangGraph",
                "data": {
                    "output": {
                        "ai_response": "This is a mocked AI response."
                    }
                }
            }

        mock_graph.astream_events = mock_astream_events

        resp = client.post(
            "/api/v1/multi_rag/chat",
            json={"message": "What is AI?"},
            cookies=auth_cookies,
        )
        print(f"[CHAT] Mocked chat status: {resp.status_code}, body: {resp.text}")

        assert resp.status_code == 200
        
        lines = [line.strip() for line in resp.text.split("\n") if line.strip()]
        events = []
        for line in lines:
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))
        
        assert len(events) >= 2
        assert events[0]["type"] == "token"
        assert events[0]["content"] == "This is a mocked AI response."
        assert events[1]["type"] == "done"
        assert events[1]["content"] == "This is a mocked AI response."

    @patch("api.routes.multi_rag_routes.graph")
    def test_chat_response_includes_user_info(self, mock_graph, client, thread_id, auth_cookies):
        """Chat response stream must include the user dict alongside the AI response in done event."""
        artifact_dir = f"artifacts/{thread_id}/transformation/store2"
        os.makedirs(artifact_dir, exist_ok=True)

        async def mock_astream_events(*args, **kwargs):
            yield {
                "event": "on_chat_model_stream",
                "tags": ["chat_token"],
                "data": {
                    "chunk": MagicMock(content="Mocked response.")
                }
            }
            yield {
                "event": "on_chain_end",
                "name": "LangGraph",
                "data": {
                    "output": {
                        "ai_response": "Mocked response."
                    }
                }
            }

        mock_graph.astream_events = mock_astream_events

        resp = client.post(
            "/api/v1/multi_rag/chat",
            json={"message": "Who are you?"},
            cookies=auth_cookies,
        )
        
        lines = [line.strip() for line in resp.text.split("\n") if line.strip()]
        events = []
        for line in lines:
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))
                
        assert len(events) >= 2
        done_event = events[1]
        assert done_event["type"] == "done"
        assert "user" in done_event
        assert done_event["user"].get("thread_id") == thread_id


# ─────────────────────────────────────────────────────────────
#  6. Load Conversation Router Tests
# ─────────────────────────────────────────────────────────────

class TestLoadConversationRouter:

    def test_load_conversation_without_auth_returns_401(self, client):
        """No cookie → middleware blocks with 401."""
        resp = client.get("/api/v1/multi_rag/conversation")
        print(f"\n[CONV] No-auth status: {resp.status_code}")
        assert resp.status_code == 401

    @patch("api.routes.multi_rag_routes.GraphConversationLoader", new_callable=AsyncMock)
    def test_load_conversation_returns_messages_list(self, mock_loader, client, auth_cookies):
        """Successfully loader mock yields 200 with messages list."""
        mock_loader.return_value = []
        resp = client.get("/api/v1/multi_rag/conversation", cookies=auth_cookies)

        print(f"[CONV] Load conversation status: {resp.status_code}, body: {resp.json()}")
        assert resp.status_code == 200
        body = resp.json()
        assert "data" in body and "messages" in body["data"]
        assert isinstance(body["data"]["messages"], list)
        assert mock_loader.called
