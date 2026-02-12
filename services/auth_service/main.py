from fastapi import FastAPI, status
from pydantic import BaseModel
from datetime import date

app = FastAPI(title="Auth Service")

class UserRegistration(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    dob: date

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegistration):
    print(f"Registering user: {user.email}")
    # Logic for registration, password hashing, etc.
    return {"message": "User registered, verification pending"}
