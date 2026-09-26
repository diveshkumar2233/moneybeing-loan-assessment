"""Populate only a dedicated submission database with explicitly synthetic leads."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.api.leads import create_lead
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models import Lead
from app.schemas.lead import LeadCreate
from fastapi import Response
from sqlalchemy import select
from sqlalchemy.engine import make_url


def main():
    if make_url(get_settings().database_url).database != "moneybeing_submission":
        raise SystemExit("Demo seeding is restricted to moneybeing_submission.")
    names = [
        "Asha Demo",
        "Rohan Demo",
        "Meera Demo",
        "Arjun Demo",
        "Kavya Demo",
        "Vikram Demo",
        "Neha Demo",
        "Rahul Demo",
        "Priya Demo",
        "Amit Demo",
        "Sana Demo",
        "Dev Demo",
    ]
    with SessionLocal() as db:
        for index, name in enumerate(names):
            mobile = str(9000000100 + index)
            if db.scalar(select(Lead.id).where(Lead.mobile == mobile)):
                continue
            data = LeadCreate(
                full_name=name,
                mobile=mobile,
                email=f"demo{index + 1}@example.com",
                date_of_birth="1995-05-12",
                city="Bengaluru",
                pincode="560001",
                loan_type="Home Loan" if index % 2 == 0 else "LAP",
                employment_type="Salaried" if index % 2 == 0 else "Self Employed",
                monthly_income=20000 if index % 4 == 0 else 75000,
                loan_amount=5500000 if index % 5 == 0 else 4000000,
                property_value=6000000,
                consent=True,
            )
            create_lead(data, Response(), db)
    print("Synthetic demo applications ready. No real customer data was copied.")


if __name__ == "__main__":
    main()
