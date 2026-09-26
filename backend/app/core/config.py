from functools import lru_cache
from pathlib import Path

from pydantic import Field
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
    mock_credit_failure: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
