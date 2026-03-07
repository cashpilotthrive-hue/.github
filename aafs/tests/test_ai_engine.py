import pytest
from fastapi.testclient import TestClient
from aafs.services.ai_engine.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_evaluate_approved():
    proposal = {
        "id": "p1",
        "target_sector": "Renewable Energy",
        "amount": 1000000,
        "description": "Solar farm expansion.",
        "environmental_impact_score": 0.9,
        "social_impact_score": 0.8
    }
    response = client.post("/evaluate", json=proposal)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "APPROVED"
    assert "meets all ethical and theological criteria" in data["reasons"][0]

def test_evaluate_rejected_sector():
    proposal = {
        "id": "p2",
        "target_sector": "Tobacco",
        "amount": 500000,
        "description": "New cigarette production line.",
        "environmental_impact_score": 0.7,
        "social_impact_score": 0.6
    }
    response = client.post("/evaluate", json=proposal)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "REJECTED"
    assert "forbidden" in data["reasons"][0]

def test_evaluate_rejected_environmental():
    proposal = {
        "id": "p3",
        "target_sector": "Manufacturing",
        "amount": 2000000,
        "description": "Industrial plant with high emissions.",
        "environmental_impact_score": 0.3,
        "social_impact_score": 0.7
    }
    response = client.post("/evaluate", json=proposal)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "REJECTED"
    assert "Environmental impact score (0.3) is below the threshold" in data["reasons"][0]

def test_evaluate_needs_review_social():
    proposal = {
        "id": "p4",
        "target_sector": "Tech",
        "amount": 1500000,
        "description": "New AI software.",
        "environmental_impact_score": 0.8,
        "social_impact_score": 0.4
    }
    response = client.post("/evaluate", json=proposal)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "NEEDS_REVIEW"
    assert "Social impact score (0.4) is low" in data["reasons"][0]
