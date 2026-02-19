from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "email": "user@example.com",
            "password": "securepassword",
            "first_name": "John",
            "last_name": "Doe",
            "dob": "1990-01-01"
        },
    )
    assert response.status_code == 201
    assert response.json()["message"] == "User registered, verification pending"
