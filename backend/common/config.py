# common/config.py
from functools import lru_cache

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# La clase se llama CommonSettings (Correcto)
class CommonSettings(BaseSettings):
    # --- Supabase Core, Auth & Security ---
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    # --- JWT Settings (DEPRECATED) ---
    # These settings are kept for backwards compatibility but are no longer used.
    # Token validation now uses Supabase's native db.auth.get_user() method.
    JWT_ALGORITHM: str = "ES256"  # DEPRECATED: No longer used
    JWT_AUDIENCE: str = "authenticated"
    SUPABASE_JWT_SECRET: str | None = None  # DEPRECATED: No longer used
    SUPABASE_JWKS_URL: str | None = None  # DEPRECATED: No longer used

    # --- App Metadatos ---

    # Optional: Only required for auth_service (AI features)
    GOOGLE_API_KEY: str | None = None
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Oasis Digital API"
    VERSION: str = "0.0.0"
    DESCRIPTION: str = "Oasis Platform Service"
    BACKEND_CORS_ORIGINS: list[str | AnyHttpUrl] = []

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=True
    )

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list | str):
            return v
        raise ValueError(v)


@lru_cache
def get_settings() -> CommonSettings:
    return CommonSettings()


settings = get_settings()
