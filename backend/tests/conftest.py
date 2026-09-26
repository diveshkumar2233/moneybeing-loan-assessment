import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-with-at-least-32-characters")
os.environ.setdefault("ADMIN_PASSWORD", "TestingPassword123")

import pytest
from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models import User
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture
def db():
    url = os.environ.get("TEST_DATABASE_URL", "sqlite://")
    options = (
        {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
        if url == "sqlite://"
        else {}
    )
    engine = create_engine(url, **options)
    # TEST_DATABASE_URL must point to a dedicated disposable test database.
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine, expire_on_commit=False)() as session:
        yield session
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin(db):
    user = User(
        email="admin@example.com",
        password_hash=hash_password("TestingPassword123"),
        role="admin",
    )
    db.add(user)
    db.commit()
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


@pytest.fixture
def payload():
    return {
        "full_name": "Asha Sharma",
        "mobile": "9876543210",
        "email": "asha@example.com",
        "date_of_birth": "1995-05-12",
        "city": "Bengaluru",
        "pincode": "560001",
        "loan_type": "Home Loan",
        "employment_type": "Salaried",
        "monthly_income": "75000",
        "loan_amount": "4000000",
        "property_value": "6000000",
        "consent": True,
    }
