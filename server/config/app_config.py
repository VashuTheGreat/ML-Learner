from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
from urllib.parse import quote_plus
import boto3

class AppConfig(BaseSettings):
    app_name: str
    app_env: str
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days:int
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")


@lru_cache
def getAppConfig():
    return AppConfig()  # type: ignore


app_config=getAppConfig()