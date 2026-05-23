from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Studio Production Pipeline API"
    debug: bool = False
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    api_prefix: str = "/api"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
