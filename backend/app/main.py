from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    pass


def create_app() -> FastAPI:
    settings = get_settings()
    
    app = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    from app.api import (
        plants_router, species_router, care_router, chat_router,
        milestones_router, vision_router, weather_router, ai_router
    )
    
    app.include_router(plants_router, prefix="/api/v1")
    app.include_router(species_router, prefix="/api/v1")
    app.include_router(care_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(milestones_router, prefix="/api/v1")
    app.include_router(vision_router, prefix="/api/v1")
    app.include_router(weather_router, prefix="/api/v1")
    app.include_router(ai_router, prefix="/api/v1")

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    return app


app = create_app()