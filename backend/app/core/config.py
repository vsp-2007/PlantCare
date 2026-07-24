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
    WEATHERAPI_KEY: str = "32bd1bfa43294eadb7e162102252702"
    KINDWISE_KEY: str = "6znrGZy8RiCTMpma6jnIMlKRHyhkN2PW6JRkyk40IxLy0C7o9F"
    LLM_API_KEY: str = "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"
    LLM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    LLM_MODEL: str = "nvidia/nemotron-3.5-nano-30b-a3b"

    # Kindwise limits
    KINDWISE_MONTHLY_LIMIT: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()