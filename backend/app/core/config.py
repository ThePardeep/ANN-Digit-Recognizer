"""Centralized application configuration.

Settings are loaded from environment variables (and an optional `.env` file)
so behavior can change between environments without code changes.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application-wide configuration values."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    app_name: str = "Digit Recognition API"
    api_v1_prefix: str = "/api"
    environment: str = "development"
    log_level: str = "INFO"

    model_path: Path = BACKEND_ROOT / "app" / "models" / "digit_ann.keras"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    max_upload_size_bytes: int = 2 * 1024 * 1024  # 2 MB


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
