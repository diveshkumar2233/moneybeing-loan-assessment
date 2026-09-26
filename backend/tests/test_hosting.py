import pytest
from app.core.config import Settings
from app.core.frontend import mount_frontend
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.mark.parametrize(
    "prefix", ["postgres://", "postgresql://", "postgresql+psycopg://"]
)
def test_hosted_database_url(prefix):
    settings = Settings(
        _env_file=None,
        database_url=prefix + "user:password@db:5432/demo?sslmode=require",
        secret_key="test-secret-with-at-least-32-characters",
        admin_password="test-password-123",
    )
    assert (
        settings.database_url
        == "postgresql+psycopg://user:password@db:5432/demo?sslmode=require"
    )


def test_frontend_routes_do_not_hide_api(tmp_path):
    (tmp_path / "index.html").write_text("Application form")
    (tmp_path / "login").mkdir()
    (tmp_path / "login" / "index.html").write_text("Admin login")
    app = FastAPI()

    @app.get("/api/example")
    def example():
        return {"status": "ok"}

    mount_frontend(app, str(tmp_path))
    with TestClient(app) as client:
        assert client.get("/").text == "Application form"
        assert client.get("/login/").text == "Admin login"
        assert client.get("/api/example").json() == {"status": "ok"}
        assert client.get("/api/nonexistent").status_code == 404
        assert client.get("/openapi.json").status_code == 200
