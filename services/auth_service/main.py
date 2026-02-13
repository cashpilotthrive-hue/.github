from fastapi import FastAPI, status, HTTPException, Request
from pydantic import BaseModel, EmailStr
from datetime import date
import sqlite3
import os
import hashlib
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

app = FastAPI(title="Auth Service")
app.add_middleware(SecurityHeadersMiddleware)

DB_PATH = "auth.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password_hash BLOB NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            dob TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def hash_password(password: str) -> bytes:
    """Securely hash a password using scrypt."""
    salt = os.urandom(16)
    hashed = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return salt + hashed

def verify_password(password: str, stored: bytes) -> bool:
    """Verify a password against a stored scrypt hash."""
    salt = stored[:16]
    hashed = stored[16:]
    new_hashed = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return new_hashed == hashed

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    dob: date

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegistration):
    password_hash = hash_password(user.password)

    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (email, password_hash, first_name, last_name, dob)
            VALUES (?, ?, ?, ?, ?)
        ''', (user.email, password_hash, user.first_name, user.last_name, user.dob.isoformat()))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()

    print(f"User registered successfully: {user.email}")
    return {"message": "User registered successfully"}
