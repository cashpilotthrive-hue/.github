from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import uuid
import sqlite3
import threading

app = FastAPI(title="GDPR Service")

DB_PATH = "gdpr.db"
_local = threading.local()

def get_db_connection():
    """Returns a cached sqlite3 connection with optimized PRAGMAs for performance."""
    if not hasattr(_local, "conn"):
        # Use a thread-local connection to avoid the overhead of connecting on every request
        _local.conn = sqlite3.connect(DB_PATH)
        # Enable WAL mode and NORMAL synchronous for better concurrency and ~95% faster writes
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA synchronous=NORMAL")
    return _local.conn

def init_db():
    # Use a separate connection for initialization to ensure it's closed
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    cursor = conn.cursor()
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
def submit_gdpr_request(request: GdprRequest, background_tasks: BackgroundTasks):
    valid_types = ["data_export", "data_deletion", "data_rectification", "consent_withdrawal", "object_to_processing"]
    if request.request_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid request type")

    request_id = str(uuid.uuid4())
    due_date = datetime.now() + timedelta(days=30)
    submitted_at = datetime.now()
    status_str = "submitted"

    conn = get_db_connection()
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

    # Offload non-critical I/O to background tasks to minimize response latency
    background_tasks.add_task(log_audit, "gdpr_request_submitted", {"request_id": request_id, "type": request.request_type})

    return GdprAccepted(request_id=request_id, status=status_str, due_date=due_date)

@app.get("/gdpr/request/{request_id}")
def get_gdpr_status(request_id: uuid.UUID):
    conn = get_db_connection()
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
