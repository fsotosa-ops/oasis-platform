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
    JWT_ALGORITHM: str = "ES256"  # ES256 (JWKS) or HS256 (secret)
    JWT_AUDIENCE: str = "authenticated"
    # For HS256: required. For ES256: optional (uses JWKS instead)
    SUPABASE_JWT_SECRET: str | None = None
    # For ES256: auto-generated from SUPABASE_URL if not provided
    SUPABASE_JWKS_URL: str | None = None

    @validator("SUPABASE_JWKS_URL", pre=True, always=True)
    def set_jwks_url(cls, v, values):
        """Auto-generate JWKS URL from SUPABASE_URL if not provided."""
        if v:
            return v
        supabase_url = values.get("SUPABASE_URL")
        if supabase_url:
            return f"{supabase_url}/auth/v1/.well-known/jwks.json"
        return None

    @validator("SUPABASE_JWT_SECRET", pre=True, always=True)
    def validate_jwt_config(cls, v, values):
        """Ensure JWT secret is provided if using HS256."""
        algorithm = values.get("JWT_ALGORITHM", "ES256")
        if algorithm == "HS256" and not v:
            raise ValueError("SUPABASE_JWT_SECRET is required when using HS256")
        return v

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
