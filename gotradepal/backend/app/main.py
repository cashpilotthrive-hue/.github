from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.agents.orchestrator import AIOrchestrator
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import Base, engine, get_db
from app.models.models import EconomicProfile, FinanceEntry, Opportunity, User
from app.schemas.schemas import ChatIn, FinanceEntryIn, ProfileIn, Token, UserCreate

Base.metadata.create_all(bind=engine)
app = FastAPI(title="GoTradePal API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins.split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
orchestrator = AIOrchestrator()

@app.get("/health")
def health():
    return {"status": "ok", "service": "gotradepal"}

@app.post("/auth/signup", response_model=Token)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(409, "Email already registered")
    user = User(name=payload.name, email=payload.email, phone=payload.phone, country=payload.country, hashed_password=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    return Token(access_token=create_access_token(str(user.id)))

@app.post("/auth/login", response_model=Token)
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return Token(access_token=create_access_token(str(user.id)))

@app.post("/profiles/{user_id}")
def upsert_profile(user_id: str, payload: ProfileIn, db: Session = Depends(get_db)):
    profile = db.scalar(select(EconomicProfile).where(EconomicProfile.user_id == user_id)) or EconomicProfile(user_id=user_id)
    for key, value in payload.model_dump().items(): setattr(profile, key, value)
    db.add(profile); db.commit(); db.refresh(profile)
    return {"id": str(profile.id), "roadmap": ["Stabilize finances", "Grow marketable skills", "Apply to opportunities"]}

@app.get("/dashboard/{user_id}")
def dashboard(user_id: str, db: Session = Depends(get_db)):
    income = db.scalar(select(func.coalesce(func.sum(FinanceEntry.amount), 0)).where(FinanceEntry.user_id == user_id, FinanceEntry.entry_type == "income"))
    expenses = db.scalar(select(func.coalesce(func.sum(FinanceEntry.amount), 0)).where(FinanceEntry.user_id == user_id, FinanceEntry.entry_type == "expense"))
    savings_rate = float((income - expenses) / income) if income else 0
    score = max(0, min(100, int(50 + savings_rate * 100)))
    return {"financial_health_score": score, "income": float(income), "expenses": float(expenses), "savings_rate": savings_rate, "recommendations": ["Log weekly expenses", "Complete one course", "Apply to two opportunities"]}

@app.post("/finance/{user_id}")
def add_finance(user_id: str, payload: FinanceEntryIn, db: Session = Depends(get_db)):
    entry = FinanceEntry(user_id=user_id, **payload.model_dump())
    db.add(entry); db.commit(); db.refresh(entry)
    return {"id": str(entry.id)}

@app.get("/finance/{user_id}/report")
def finance_report(user_id: str, db: Session = Depends(get_db)):
    rows = db.execute(select(FinanceEntry.category, FinanceEntry.entry_type, func.sum(FinanceEntry.amount)).where(FinanceEntry.user_id == user_id).group_by(FinanceEntry.category, FinanceEntry.entry_type)).all()
    return {"format": "json", "rows": [{"category": r[0], "type": r[1], "amount": float(r[2])} for r in rows]}

@app.get("/opportunities")
def opportunities(db: Session = Depends(get_db)):
    return db.scalars(select(Opportunity).limit(50)).all()

@app.post("/ai/chat")
def ai_chat(payload: ChatIn):
    response = orchestrator.route(payload.agent, payload.message)
    return response.__dict__

@app.get("/admin/analytics")
def admin_analytics(db: Session = Depends(get_db)):
    return {"users": db.scalar(select(func.count(User.id))), "opportunities": db.scalar(select(func.count(Opportunity.id))), "ai_agents": list(orchestrator.agents.keys())}
