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


def initialize_admin(db, settings):
    user = db.scalar(select(User).where(User.email == settings.admin_email.lower()))
    if user is None:
        db.add(
            User(
                email=settings.admin_email.lower(),
                password_hash=hash_password(settings.admin_password),
                role="admin",
            )
        )
    elif settings.reset_admin_password_on_start:
        # Deployment operators must opt in; ordinary restarts preserve passwords.
        if user.role != "admin" or not user.is_active:
            raise ValueError("Password reset requires an existing active admin account")
        user.password_hash = hash_password(settings.admin_password)
    return settings.reset_admin_password_on_start


def main():
    # Only seed a newly created rules table. Deleted rules must stay deleted.
    seed_rules = not inspect(engine).has_table("rules")
    Base.metadata.create_all(engine)
    settings = get_settings()
    with SessionLocal.begin() as db:
        reset_requested = initialize_admin(db, settings)
        if seed_rules:
            # Validate seed data with the same schema used by the admin rule API.
            for data in json.loads(
                Path(__file__).with_name("default_rules.json").read_text()
            ):
                db.add(Rule(**RuleWrite.model_validate(data).model_dump()))
    print("Database initialized; admin and first-install rules ready.")
    if reset_requested:
        print(
            "Admin password configured. Set RESET_ADMIN_PASSWORD_ON_START=false after login succeeds."
        )


if __name__ == "__main__":
    main()
