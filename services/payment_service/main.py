from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI(title="Payment Service")

class DepositRequest(BaseModel):
    amount: float
    currency: str = "GBP"
    payment_method_id: str

@app.post("/payment/deposit", status_code=status.HTTP_200_OK)
async def deposit_funds(deposit: DepositRequest):
    print(f"Initiating deposit of {deposit.amount} {deposit.currency}")
    return {"status": "initiated", "transaction_id": "tx123"}
