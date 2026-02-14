from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Safe Omni Assistant API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-memory stores for demo purposes.
CHAT_HISTORY: list[dict[str, Any]] = []
MEMORIES: dict[str, list[str]] = {}
FILES: dict[str, dict[str, Any]] = {}
AUDIT_LOG: list[dict[str, Any]] = []


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(system|user|assistant|tool)$")
    content: str


class ChatRequest(BaseModel):
    user_id: str
    messages: list[ChatMessage]
    tools_enabled: bool = True
    vision_enabled: bool = True
    voice_enabled: bool = True
    memory_enabled: bool = True


class ChatResponse(BaseModel):
    response_id: str
    content: str
    tool_calls: list[dict[str, Any]]
    timestamp: datetime


class MemoryUpsertRequest(BaseModel):
    user_id: str
    note: str


class ModerationRequest(BaseModel):
    content: str


class ModerationResponse(BaseModel):
    flagged: bool
    categories: list[str]


class ToolRunRequest(BaseModel):
    name: str
    args: dict[str, Any] = Field(default_factory=dict)


class AllFeaturesRequest(BaseModel):
    user_id: str
    message: str
    note: str = ""


SAFE_BLOCKLIST = {
    "credit card fraud",
    "phishing kit",
    "malware",
    "ransomware",
    "credential stuffing",
    "identity theft",
    "wire fraud",
}


def append_audit(event: str, detail: dict[str, Any]) -> None:
    AUDIT_LOG.append(
        {
            "id": str(uuid.uuid4()),
            "event": event,
            "detail": detail,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/moderate", response_model=ModerationResponse)
def moderate(payload: ModerationRequest) -> ModerationResponse:
    lowered = payload.content.lower()
    hits = [term for term in SAFE_BLOCKLIST if term in lowered]
    return ModerationResponse(flagged=bool(hits), categories=hits)


def _chat_logic(
    payload: ChatRequest,
    background_tasks: BackgroundTasks,
    pre_moderation: ModerationResponse | None = None,
) -> ChatResponse:
    """
    Internal chat logic. Allows pre_moderation to be passed in to avoid redundant checks.
    """
    latest_user_message = next(
        (m.content for m in reversed(payload.messages) if m.role == "user"), ""
    )

    # Use pre-calculated moderation if provided (e.g., from call_all_features_response)
    moderation = pre_moderation or moderate(ModerationRequest(content=latest_user_message))

    if moderation.flagged:
        background_tasks.add_task(
            append_audit,
            "chat.blocked",
            {"user_id": payload.user_id, "categories": moderation.categories},
        )
        raise HTTPException(
            status_code=400,
            detail="Request contains unsafe content and was blocked by moderation.",
        )

    memory_snippet = ""
    if payload.memory_enabled and payload.user_id in MEMORIES:
        memory_snippet = f"\nMemory context: {' | '.join(MEMORIES[payload.user_id][-3:])}"

    tool_calls: list[dict[str, Any]] = []
    if payload.tools_enabled and "time" in latest_user_message.lower():
        tool_calls.append(
            {
                "tool": "get_current_time",
                "result": datetime.now(timezone.utc).isoformat(),
            }
        )

    content = (
        "Safe Omni Assistant response:\n"
        f"- You said: {latest_user_message}\n"
        f"- Vision enabled: {payload.vision_enabled}\n"
        f"- Voice enabled: {payload.voice_enabled}\n"
        f"- Tools enabled: {payload.tools_enabled}"
        f"{memory_snippet}"
    )

    response = ChatResponse(
        response_id=str(uuid.uuid4()),
        content=content,
        tool_calls=tool_calls,
        timestamp=datetime.now(timezone.utc),
    )

    CHAT_HISTORY.append({"request": payload.model_dump(), "response": response.model_dump()})
    background_tasks.add_task(append_audit, "chat.completed", {"user_id": payload.user_id})
    return response


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, background_tasks: BackgroundTasks) -> ChatResponse:
    return _chat_logic(payload, background_tasks)


def _upsert_memory_logic(
    payload: MemoryUpsertRequest, background_tasks: BackgroundTasks
) -> dict[str, Any]:
    MEMORIES.setdefault(payload.user_id, []).append(payload.note)
    background_tasks.add_task(append_audit, "memory.upserted", payload.model_dump())
    return {"ok": True, "count": len(MEMORIES[payload.user_id])}


@app.post("/memory")
def upsert_memory(payload: MemoryUpsertRequest, background_tasks: BackgroundTasks) -> dict[str, Any]:
    return _upsert_memory_logic(payload, background_tasks)


@app.get("/memory/{user_id}")
def get_memory(user_id: str) -> dict[str, Any]:
    return {"user_id": user_id, "notes": MEMORIES.get(user_id, [])}


@app.post("/files")
async def upload_file(
    background_tasks: BackgroundTasks, file: UploadFile = File(...)
) -> dict[str, Any]:
    fid = str(uuid.uuid4())
    raw = await file.read()
    meta = {"id": fid, "name": file.filename, "size": len(raw)}
    FILES[fid] = meta
    background_tasks.add_task(append_audit, "file.uploaded", meta)
    return meta


@app.get("/audit")
def get_audit() -> list[dict[str, Any]]:
    return AUDIT_LOG


def _run_tool_logic(payload: ToolRunRequest, background_tasks: BackgroundTasks) -> dict[str, Any]:
    if payload.name == "get_current_time":
        result = {"timestamp": datetime.now(timezone.utc).isoformat()}
    elif payload.name == "summarize_text":
        text = str(payload.args.get("text", ""))
        result = {
            "summary": text[:120] + ("..." if len(text) > 120 else ""),
            "chars": len(text),
        }
    else:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {payload.name}")

    background_tasks.add_task(append_audit, "tool.ran", {"name": payload.name})
    return {"tool": payload.name, "result": result}


@app.post("/tools/run")
def run_tool(payload: ToolRunRequest, background_tasks: BackgroundTasks) -> dict[str, Any]:
    return _run_tool_logic(payload, background_tasks)


@app.post("/features/respond")
def call_all_features_response(
    payload: AllFeaturesRequest, background_tasks: BackgroundTasks
) -> dict[str, Any]:
    moderation = moderate(ModerationRequest(content=payload.message))
    if moderation.flagged:
        background_tasks.add_task(
            append_audit,
            "features.respond.blocked",
            {"user_id": payload.user_id, "categories": moderation.categories},
        )
        raise HTTPException(status_code=400, detail="Unsafe content blocked by moderation")

    saved_memory = None
    if payload.note.strip():
        saved_memory = _upsert_memory_logic(
            MemoryUpsertRequest(user_id=payload.user_id, note=payload.note.strip()),
            background_tasks=background_tasks,
        )

    chat_result = _chat_logic(
        ChatRequest(
            user_id=payload.user_id,
            messages=[ChatMessage(role="user", content=payload.message)],
            tools_enabled=True,
            vision_enabled=True,
            voice_enabled=True,
            memory_enabled=True,
        ),
        background_tasks=background_tasks,
        pre_moderation=moderation,
    )

    tool_result = _run_tool_logic(
        ToolRunRequest(name="summarize_text", args={"text": payload.message}),
        background_tasks=background_tasks,
    )
    memory_result = get_memory(payload.user_id)
    audit_snapshot = AUDIT_LOG[-5:]

    background_tasks.add_task(
        append_audit, "features.respond.completed", {"user_id": payload.user_id}
    )
    return {
        "moderation": moderation.model_dump(),
        "saved_memory": saved_memory,
        "chat": chat_result.model_dump(),
        "tool": tool_result,
        "memory": memory_result,
        "audit_tail": audit_snapshot,
    }
