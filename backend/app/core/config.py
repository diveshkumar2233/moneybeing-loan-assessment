from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env", extra="ignore"
    )
    database_url: str = (
        "postgresql+psycopg://moneybeing:moneybeing@localhost:5432/moneybeing"
    )
    secret_key: str = Field(min_length=32)
    access_token_expire_minutes: int = Field(default=60, ge=1)
    cors_origins: list[str] = ["http://localhost:3000"]
    admin_email: str = "admin@moneybeing.local"
    admin_password: str = Field(min_length=12)
    reset_admin_password_on_start: bool = False
    mock_credit_failure: bool = False
    static_frontend_dir: str | None = None

    @field_validator("database_url", mode="before")
    @classmethod
    def use_psycopg_driver(cls, value: str) -> str:
        # Hosting providers supply a standard PostgreSQL URL; use installed psycopg 3.
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix) :]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
