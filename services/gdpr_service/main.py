from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import uuid
import sqlite3
import threading

app = FastAPI(title="GDPR Service")

DB_PATH = "gdpr.db"

_thread_local = threading.local()

def get_db_conn():
    """Returns a thread-local SQLite connection with optimized PRAGMAs."""
    if not hasattr(_thread_local, "conn"):
        # We use a thread-local connection to avoid the overhead of opening/closing
        # a new connection for every request.
        _thread_local.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        # WAL mode is persistent in the DB file, but synchronous=NORMAL is not.
        # synchronous=NORMAL is safe with WAL and provides significant performance gains.
        _thread_local.conn.execute("PRAGMA synchronous=NORMAL")
    return _thread_local.conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Enable WAL mode for better concurrency
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gdpr_requests (
            request_id TEXT PRIMARY KEY,
            status TEXT,
            due_date TEXT,
            request_type TEXT,
            request_details TEXT,
            submitted_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Models based on OpenAPI spec
class GdprRequest(BaseModel):
    request_type: str
    request_details: Optional[str] = None

class GdprAccepted(BaseModel):
    request_id: uuid.UUID
    status: str
    due_date: datetime

def log_audit(event_type: str, details: dict):
    # Placeholder for Audit Log integration
    print(f"DEBUG: Audit Log [{event_type}]: {details}")

@app.post("/gdpr/request", response_model=GdprAccepted, status_code=status.HTTP_202_ACCEPTED)
def submit_gdpr_request(request: GdprRequest):
    valid_types = ["data_export", "data_deletion", "data_rectification", "consent_withdrawal", "object_to_processing"]
    if request.request_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid request type")

    request_id = str(uuid.uuid4())
    due_date = datetime.now() + timedelta(days=30)
    submitted_at = datetime.now()
    status_str = "submitted"

    conn = get_db_conn()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO gdpr_requests (request_id, status, due_date, request_type, request_details, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (request_id, status_str, due_date.isoformat(), request.request_type, request.request_details, submitted_at.isoformat()))
        conn.commit()
    except Exception:
        conn.rollback()
        raise

    log_audit("gdpr_request_submitted", {"request_id": request_id, "type": request.request_type})

    return GdprAccepted(request_id=request_id, status=status_str, due_date=due_date)

@app.get("/gdpr/request/{request_id}")
def get_gdpr_status(request_id: uuid.UUID):
    conn = get_db_conn()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT request_id, status, due_date, request_type FROM gdpr_requests WHERE request_id = ?', (str(request_id),))
        row = cursor.fetchone()
    except Exception:
        conn.rollback()
        raise

    if not row:
        raise HTTPException(status_code=404, detail="Request not found")

    return {
        "request_id": row[0],
        "status": row[1],
        "due_date": datetime.fromisoformat(row[2]),
        "request_type": row[3]
    }
