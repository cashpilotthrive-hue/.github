from fastapi import FastAPI, HTTPException, status, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import sqlite3
import threading
import json
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

app = FastAPI(title="Support Service")
app.add_middleware(SecurityHeadersMiddleware)

DB_PATH = "support.db"
_local = threading.local()

def get_db_connection():
    if not hasattr(_local, "conn"):
        _local.conn = sqlite3.connect(DB_PATH)
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA synchronous=NORMAL")
    return _local.conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            ticket_id TEXT PRIMARY KEY,
            status TEXT,
            created_at TEXT,
            subject TEXT,
            category TEXT,
            priority TEXT,
            description TEXT,
            attachments TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class TicketCreateRequest(BaseModel):
    subject: str
    category: str
    priority: Optional[str] = "medium"
    description: str
    attachments: Optional[List[str]] = []

class TicketResponse(BaseModel):
    ticket_id: uuid.UUID
    status: str
    created_at: datetime

def emit_event(topic: str, payload: dict):
    print(f"DEBUG: Emitting to Kafka [{topic}]: {payload}")

def log_audit(event_type: str, details: dict):
    print(f"DEBUG: Audit Log [{event_type}]: {details}")

@app.post("/support/ticket", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(request: TicketCreateRequest):
    ticket_id = str(uuid.uuid4())
    created_at = datetime.now()
    status_str = "open"

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        attachments_json = json.dumps(request.attachments) if request.attachments else "[]"
        cursor.execute('''
            INSERT INTO tickets (ticket_id, status, created_at, subject, category, priority, description, attachments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (ticket_id, status_str, created_at.isoformat(), request.subject, request.category, request.priority, request.description, attachments_json))
        conn.commit()
    except Exception:
        conn.rollback()
        raise

    emit_event("support.ticket.created", {"ticket_id": ticket_id, "subject": request.subject})
    log_audit("support_ticket_created", {"ticket_id": ticket_id, "user_id": "system"})
    return TicketResponse(ticket_id=ticket_id, status=status_str, created_at=created_at)

@app.get("/support/ticket/{ticket_id}")
def get_ticket(ticket_id: uuid.UUID):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT ticket_id, status, created_at, subject, category, priority, description, attachments FROM tickets WHERE ticket_id = ?', (str(ticket_id),))
        row = cursor.fetchone()
    except Exception:
        conn.rollback()
        raise

    if not row:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return {
        "ticket_id": row[0],
        "status": row[1],
        "created_at": datetime.fromisoformat(row[2]),
        "subject": row[3],
        "category": row[4],
        "priority": row[5],
        "description": row[6],
        "attachments": json.loads(row[7]) if row[7] else []
    }
