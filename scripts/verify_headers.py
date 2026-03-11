from fastapi.testclient import TestClient
import sys
import os

# Add services to path
sys.path.append(os.getcwd())

from services.auth_service.main import app as auth_app
from services.gdpr_service.main import app as gdpr_app
from services.support_service.main import app as support_app

def check_headers(client, name):
    print(f"Checking headers for {name}...")
    response = client.get("/") # FastAPI default 404/docs also has headers
    headers = response.headers
    expected = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Content-Security-Policy",
        "Strict-Transport-Security"
    ]
    for h in expected:
        if h in headers:
            print(f"  [OK] {h}: {headers[h]}")
        else:
            print(f"  [FAIL] Missing header: {h}")
            return False
    return True

if __name__ == "__main__":
    success = True
    success &= check_headers(TestClient(auth_app), "Auth Service")
    success &= check_headers(TestClient(gdpr_app), "GDPR Service")
    success &= check_headers(TestClient(support_app), "Support Service")

    if success:
        print("\nAll security headers verified successfully!")
        sys.exit(0)
    else:
        print("\nSecurity header verification failed!")
        sys.exit(1)
