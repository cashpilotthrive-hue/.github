import pytest
from fastapi.testclient import TestClient
from aafs.services.ledger.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_record_transaction():
    entry = {
        "transaction_type": "EVALUATION",
        "payload": {"proposal_id": "p1", "decision": "APPROVED"}
    }
    response = client.post("/record", json=entry)
    assert response.status_code == 201
    data = response.json()
    assert "tx_id" in data
    assert data["status"] == "COMMITTED"
    assert data["hash"].startswith("0x")
