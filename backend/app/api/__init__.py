from app.api.plants import router as plants_router
from app.api.species import router as species_router
from app.api.care import router as care_router
from app.api.chat import router as chat_router
from app.api.milestones import router as milestones_router
from app.api.vision import router as vision_router
from app.api.weather import router as weather_router
from app.api.ai import router as ai_router

__all__ = ["plants_router", "species_router", "care_router", "chat_router", "milestones_router", "vision_router", "weather_router", "ai_router"]