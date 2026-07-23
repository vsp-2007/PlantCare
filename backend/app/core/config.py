import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "PlantCare API"
    DEBUG: bool = True
    PORT: int = 3000

    # Database
    DATABASE_URL: str = "sqlite:///./plantcare.db"

    # External APIs
    WEATHERAPI_KEY: str = ""
    KINDWISE_KEY: str = ""
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"

    # Kindwise limits
    KINDWISE_MONTHLY_LIMIT: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()