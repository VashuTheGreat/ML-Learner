from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class AppConfig(BaseSettings):
    # ── App ────────────────────────────────────────────────────────
    app_name: str
    app_env: str

    # ── Server ─────────────────────────────────────────────────────
    port: int = 8000

    # ── Database ───────────────────────────────────────────────────
    database_url: str

    # ── Auth ───────────────────────────────────────────────────────
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int

    # ── Cloudinary ─────────────────────────────────────────────────
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    # ── LLM / Groq ─────────────────────────────────────────────────
    groq_api_key: Optional[str] = None

    # ── LangChain / Tavily ─────────────────────────────────────────
    tavily_api_key: Optional[str] = None

    # ── LinkedIn Scraper ───────────────────────────────────────────
    linked_in_user_email: Optional[str] = None
    linked_in_user_password: Optional[str] = None
    rapidapi_key: Optional[str] = None

    # ── MLFlow / DagsHub ───────────────────────────────────────────
    ml_flow_tracking_uri: Optional[str] = None
    mlflow_tracking_username: Optional[str] = None
    mlflow_tracking_password: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )


@lru_cache
def getAppConfig() -> AppConfig:
    return AppConfig()  # type: ignore


app_config: AppConfig = getAppConfig()