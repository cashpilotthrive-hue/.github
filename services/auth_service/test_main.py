from fastapi.testclient import TestClient
from .main import app, verify_password, DB_PATH
import sqlite3
import os

client = TestClient(app)

def test_register_user():
    # Clear DB before test
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    from .main import init_db
    init_db()

    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "securepassword123",
            "first_name": "John",
            "last_name": "Doe",
            "dob": "1990-01-01"
        },
    )
    assert response.status_code == 201
    assert response.json()["message"] == "User registered successfully"

    # Verify database entry
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE email = 'test@example.com'")
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    stored_hash = row[0]
    assert verify_password("securepassword123", stored_hash)
    assert not verify_password("wrongpassword", stored_hash)

def test_register_duplicate_user():
    user_data = {
        "email": "dup@example.com",
        "password": "password",
        "first_name": "Dup",
        "last_name": "User",
        "dob": "1990-01-01"
    }
    client.post("/auth/register", json=user_data)
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"
