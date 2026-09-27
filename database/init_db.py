"""Run from the project root: python database/init_db.py. Safe to rerun."""

import json
import sys
from pathlib import Path

from sqlalchemy import inspect, select

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import Rule, User
from app.schemas.rule import RuleWrite


def main():
    # Only seed a newly created rules table. Deleted rules must stay deleted.
    seed_rules = not inspect(engine).has_table("rules")
    Base.metadata.create_all(engine)
    settings = get_settings()
    with SessionLocal.begin() as db:
        if not db.scalar(
            select(User).where(User.email == settings.admin_email.lower())
        ):
            db.add(
                User(
                    email=settings.admin_email.lower(),
                    password_hash=hash_password(settings.admin_password),
                    role="admin",
                )
            )
        if seed_rules:
            # Validate seed data with the same schema used by the admin rule API.
            for data in json.loads(
                Path(__file__).with_name("default_rules.json").read_text()
            ):
                db.add(Rule(**RuleWrite.model_validate(data).model_dump()))
    print("Database initialized; admin and first-install rules ready.")


if __name__ == "__main__":
    main()
