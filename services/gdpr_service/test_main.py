from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)

def test_submit_gdpr_request():
    response = client.post(
        "/gdpr/request",
        json={
            "request_type": "data_export",
            "request_details": "Please export all my betting history"
        },
    )
    assert response.status_code == 202
    data = response.json()
    assert "request_id" in data
    assert data["status"] == "submitted"
    assert "due_date" in data

def test_submit_invalid_gdpr_request():
    response = client.post(
        "/gdpr/request",
        json={
            "request_type": "invalid_type"
        },
    )
    assert response.status_code == 400

def test_get_gdpr_status():
    response = client.post(
        "/gdpr/request",
        json={"request_type": "data_deletion"},
    )
    request_id = response.json()["request_id"]

    response = client.get(f"/gdpr/request/{request_id}")
    assert response.status_code == 200
    assert response.json()["request_type"] == "data_deletion"
