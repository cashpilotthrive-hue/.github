from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import sqlite3
app = FastAPI(title="Support Service")

DB_PATH = "support.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Enable WAL mode and NORMAL synchronous for better concurrency and performance in SQLite
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
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

# Models based on OpenAPI spec
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
    # Placeholder for Kafka event emission
    print(f"DEBUG: Emitting to Kafka [{topic}]: {payload}")

def log_audit(event_type: str, details: dict):
    # Placeholder for Audit Log integration
    print(f"DEBUG: Audit Log [{event_type}]: {details}")

@app.post("/support/ticket", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(request: TicketCreateRequest, background_tasks: BackgroundTasks):
    ticket_id = str(uuid.uuid4())
    created_at = datetime.now()
    status_str = "open"

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    attachments_str = ",".join(request.attachments) if request.attachments else ""
    cursor.execute('''
        INSERT INTO tickets (ticket_id, status, created_at, subject, category, priority, description, attachments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (ticket_id, status_str, created_at.isoformat(), request.subject, request.category, request.priority, request.description, attachments_str))
    conn.commit()
    conn.close()

    # Offload non-critical I/O to background tasks to minimize response latency
    background_tasks.add_task(emit_event, "support.ticket.created", {"ticket_id": ticket_id, "subject": request.subject})
    background_tasks.add_task(log_audit, "support_ticket_created", {"ticket_id": ticket_id, "user_id": "system"}) # user_id should come from auth

    return TicketResponse(ticket_id=ticket_id, status=status_str, created_at=created_at)

@app.get("/support/ticket/{ticket_id}")
def get_ticket(ticket_id: uuid.UUID):
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT ticket_id, status, created_at, subject, category, priority, description, attachments FROM tickets WHERE ticket_id = ?', (str(ticket_id),))
        row = cursor.fetchone()
    finally:
        conn.close()

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
        "attachments": row[7].split(",") if row[7] else []
    }
