from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)

def test_create_ticket():
    response = client.post(
        "/support/ticket",
        json={
            "subject": "Test Ticket",
            "category": "technical",
            "description": "I have a problem with my account",
            "priority": "high"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "ticket_id" in data
    assert data["status"] == "open"

    ticket_id = data["ticket_id"]
    response = client.get(f"/support/ticket/{ticket_id}")
    assert response.status_code == 200
    assert response.json()["subject"] == "Test Ticket"

def test_get_nonexistent_ticket():
    response = client.get("/support/ticket/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
