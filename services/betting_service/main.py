from fastapi import FastAPI, status
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Betting Service")

class Selection(BaseModel):
    selection_id: str
    odds: float

class BetPlacementRequest(BaseModel):
    selections: List[Selection]
    stake: float

@app.post("/betting/place", status_code=status.HTTP_201_CREATED)
async def place_bet(bet: BetPlacementRequest):
    print(f"Placing bet with stake {bet.stake}")
    return {"status": "placed", "bet_id": "bet789"}
