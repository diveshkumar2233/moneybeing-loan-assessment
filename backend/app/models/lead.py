from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = (
        CheckConstraint(
            "monthly_income > 0 AND loan_amount > 0 AND property_value > 0"
        ),
        CheckConstraint(
            "credit_score IS NULL OR (credit_score >= 300 AND credit_score <= 900)"
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), index=True)
    mobile: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(254))
    date_of_birth: Mapped[date] = mapped_column(Date)
    city: Mapped[str] = mapped_column(String(100))
    pincode: Mapped[str] = mapped_column(String(6))
    loan_type: Mapped[str] = mapped_column(String(30), index=True)
    employment_type: Mapped[str] = mapped_column(String(30))
    monthly_income: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    loan_amount: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    property_value: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    consent: Mapped[bool] = mapped_column(Boolean)
    credit_score: Mapped[int | None] = mapped_column(nullable=True)
    credit_score_error: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bre_status: Mapped[str] = mapped_column(String(20), index=True)
    rejection_reasons: Mapped[list] = mapped_column(JSON)
    rule_results: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
