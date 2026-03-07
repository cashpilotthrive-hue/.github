from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timezone

app = FastAPI(title="AAFS AI Engine", version="0.1.0")

class InvestmentProposal(BaseModel):
    id: str
    target_sector: str
    amount: float
    description: str
    environmental_impact_score: float  # 0 to 1
    social_impact_score: float         # 0 to 1

class EvaluationResponse(BaseModel):
    proposal_id: str
    decision: str  # APPROVED, REJECTED, NEEDS_REVIEW
    score: float
    reasons: List[str]
    timestamp: datetime

ETHICAL_RULES = {
    "environmental_threshold": 0.6,
    "social_threshold": 0.5,
    "forbidden_sectors": ["predatory_lending", "armaments", "tobacco"],
}

@app.get("/health")
def health():
    return {"status": "ok", "service": "AAFS AI Engine"}

@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate_proposal(proposal: InvestmentProposal):
    reasons = []
    decision = "APPROVED"
    score = (proposal.environmental_impact_score + proposal.social_impact_score) / 2

    # Check Forbidden Sectors (Theological & Justice principles)
    if proposal.target_sector.lower() in ETHICAL_RULES["forbidden_sectors"]:
        decision = "REJECTED"
        reasons.append(f"Sector '{proposal.target_sector}' is forbidden under ethical guidelines.")

    # Check Environmental Impact (Stewardship principle)
    if proposal.environmental_impact_score < ETHICAL_RULES["environmental_threshold"]:
        decision = "REJECTED"
        reasons.append(f"Environmental impact score ({proposal.environmental_impact_score}) is below the threshold ({ETHICAL_RULES['environmental_threshold']}).")

    # Check Social Impact (Compassion & Justice principles)
    if proposal.social_impact_score < ETHICAL_RULES["social_threshold"]:
        if decision != "REJECTED":
            decision = "NEEDS_REVIEW"
        reasons.append(f"Social impact score ({proposal.social_impact_score}) is low ({ETHICAL_RULES['social_threshold']}). Manual review recommended.")

    if not reasons:
        reasons.append("Proposal meets all ethical and theological criteria.")

    return EvaluationResponse(
        proposal_id=proposal.id,
        decision=decision,
        score=score,
        reasons=reasons,
        timestamp=datetime.now(timezone.utc)
    )
