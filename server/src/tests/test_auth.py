
import pytest
from fastapi.testclient import TestClient

from api.app import app


# ========= Shared TestClient =======================================
@pytest.fixture(scope="session")
def client() -> TestClient:
    """ TestClient fastapi app"""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


# ========= Auth helpers ==============================================
TEST_USER = {
    "fullName": "Test API User",
    "email": "testapi_suite@example.com",
    "username": "testapi_suite",
    "password": "Test@12345",
}


@pytest.fixture(scope="session")
def auth_token(client: TestClient) -> str:
    """
    Register (if needed) and log in the test user.
    The JWT access token is returned as a cookie by this API, so we read
    it from client.cookies after login.
    """
    # Attempt registration; 400/409 is fine if user already exists
    client.post("/api/v1/user/create", json=TEST_USER)

    resp = client.post(
        "/api/v1/user/login",
        json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
    )
    assert resp.status_code == 200, (
        f"Test-user login failed ({resp.status_code}): {resp.text}"
    )

    # Token is set as a cookie named 'accessToken'
    token = client.cookies.get("accessToken")
    if not token:
        # Fallback: some versions may also embed it in the body
        token = resp.json().get("data", {}).get("accessToken")

    assert token, "accessToken not found in login response cookies or body"
    return token


@pytest.fixture(scope="session")
def auth_headers(auth_token: str) -> dict:
    """Bearer auth header dict for use in authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}
