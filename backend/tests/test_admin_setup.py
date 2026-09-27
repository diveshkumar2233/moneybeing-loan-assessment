import importlib.util
from pathlib import Path
from types import SimpleNamespace

import pytest
from app.core.security import hash_password, verify_password
from app.models import User
from sqlalchemy import select

spec = importlib.util.spec_from_file_location(
    "init_db", Path(__file__).resolve().parents[2] / "database" / "init_db.py"
)
initializer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(initializer)


def test_password_reset_requires_opt_in_and_changes_login(db, client):
    user = User(
        email="admin@example.com",
        password_hash=hash_password("OriginalPassword123"),
        role="admin",
    )
    db.add(user)
    db.commit()
    settings = SimpleNamespace(
        admin_email=user.email,
        admin_password="ReplacementPassword123",
        reset_admin_password_on_start=False,
    )
    initializer.initialize_admin(db, settings)
    db.commit()
    assert verify_password("OriginalPassword123", user.password_hash)
    settings.reset_admin_password_on_start = True
    initializer.initialize_admin(db, settings)
    db.commit()
    assert (
        client.post(
            "/api/auth/login",
            data={"username": user.email, "password": "OriginalPassword123"},
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/api/auth/login",
            data={"username": user.email, "password": settings.admin_password},
        ).status_code
        == 200
    )


@pytest.mark.parametrize("role,active", [("viewer", True), ("admin", False)])
def test_reset_does_not_promote_or_reactivate(db, role, active):
    user = User(
        email="existing@example.com",
        password_hash=hash_password("OriginalPassword123"),
        role=role,
        is_active=active,
    )
    db.add(user)
    db.commit()
    settings = SimpleNamespace(
        admin_email=user.email,
        admin_password="ReplacementPassword123",
        reset_admin_password_on_start=True,
    )
    with pytest.raises(ValueError, match="active admin"):
        initializer.initialize_admin(db, settings)
    assert verify_password("OriginalPassword123", user.password_hash)


def test_new_admin_uses_configured_password(db):
    settings = SimpleNamespace(
        admin_email="new@example.com",
        admin_password="ReplacementPassword123",
        reset_admin_password_on_start=False,
    )
    initializer.initialize_admin(db, settings)
    db.commit()
    user = db.scalar(select(User).where(User.email == settings.admin_email))
    assert user.role == "admin"
    assert verify_password(settings.admin_password, user.password_hash)
