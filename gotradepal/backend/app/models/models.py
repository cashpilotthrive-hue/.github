import uuid
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(Text)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(Text)
    country: Mapped[str] = mapped_column(Text)
    hashed_password: Mapped[str] = mapped_column(Text)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())

class EconomicProfile(Base):
    __tablename__ = "economic_profiles"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    skills = mapped_column(JSON, default=list)
    education: Mapped[str | None] = mapped_column(Text)
    experience: Mapped[str | None] = mapped_column(Text)
    goals = mapped_column(JSON, default=list)
    income_level = mapped_column(Numeric(12, 2), nullable=True)
    interests = mapped_column(JSON, default=list)

class FinanceEntry(Base):
    __tablename__ = "finance_entries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    entry_type: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Text)
    amount = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    occurred_on = mapped_column(Date, nullable=True)
    note: Mapped[str | None] = mapped_column(Text)

class Opportunity(Base):
    __tablename__ = "opportunities"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type: Mapped[str] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    country: Mapped[str | None] = mapped_column(Text)
    remote: Mapped[bool] = mapped_column(Boolean, default=True)
    required_skills = mapped_column(JSON, default=list)
    value_estimate = mapped_column(Numeric(12, 2), nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text)
