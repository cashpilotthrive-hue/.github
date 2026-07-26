from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None
    country: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProfileIn(BaseModel):
    skills: list[str] = []
    education: str | None = None
    experience: str | None = None
    goals: list[str] = []
    income_level: float | None = None
    interests: list[str] = []

class FinanceEntryIn(BaseModel):
    entry_type: str
    category: str
    amount: float
    currency: str = "USD"
    note: str | None = None

class ChatIn(BaseModel):
    agent: str
    message: str
