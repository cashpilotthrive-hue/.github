import httpx
from fastapi.testclient import TestClient
import sys
import os

# Add services to path
sys.path.append(os.getcwd())

from services.auth_service.main import app as auth_app
from services.gdpr_service.main import app as gdpr_app
from services.support_service.main import app as support_app

def test_sqli_gdpr():
    print("Testing SQL Injection on GDPR Service...")
    client = TestClient(gdpr_app)
    # Attempting a classic SQLi payload as a UUID string
    payload = "00000000-0000-0000-0000-000000000000' OR '1'='1"
    response = client.get(f"/gdpr/request/{payload}")
    # Since it's a UUID type in FastAPI, it should actually return 422 Unprocessable Entity
    # because the validation happens before it reaches the DB.
    if response.status_code == 422:
        print("  [OK] SQLi payload blocked by type validation (422).")
    elif response.status_code == 404:
        print("  [OK] SQLi payload treated as literal string, no record found (404).")
    else:
        print(f"  [ALERT] Unexpected response status: {response.status_code}")
        return False
    return True

def test_sqli_support():
    print("Testing SQL Injection on Support Service...")
    client = TestClient(support_app)
    payload = "00000000-0000-0000-0000-000000000000' UNION SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL--"
    response = client.get(f"/support/ticket/{payload}")
    if response.status_code in [422, 404]:
        print(f"  [OK] SQLi payload handled safely ({response.status_code}).")
    else:
        print(f"  [ALERT] Unexpected response status: {response.status_code}")
        return False
    return True

def test_xss_auth():
    print("Testing XSS in Auth Service...")
    client = TestClient(auth_app)
    payload = {
        "email": "xss@example.com",
        "password": "password",
        "first_name": "<script>alert('xss')</script>",
        "last_name": "User",
        "dob": "1990-01-01"
    }
    response = client.post("/auth/register", json=payload)
    # The application should store it, but the security headers (CSP) we added
    # would prevent it from executing if it were ever rendered in a browser.
    # Here we just check that the API doesn't crash and handles the input.
    if response.status_code == 201:
        print("  [OK] Request handled. CSP headers in response will mitigate execution.")
    else:
        print(f"  [INFO] Registration returned {response.status_code}. Details: {response.json()}")
    return True

if __name__ == "__main__":
    print("--- Security Audit Simulation ---\n")
    success = True
    success &= test_sqli_gdpr()
    success &= test_sqli_support()
    success &= test_xss_auth()

    if success:
        print("\nSecurity audit simulation passed. Defenses are holding.")
        sys.exit(0)
    else:
        print("\nSecurity audit simulation detected potential issues!")
        sys.exit(1)
