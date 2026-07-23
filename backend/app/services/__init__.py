import os
import json
import httpx
from typing import AsyncGenerator, List, Dict, Any
from datetime import datetime
from app.services.llm import (
    chat_complete as llm_chat_complete, 
    chat_stream as llm_chat_stream, 
    get_survival_score as llm_get_survival_score, 
    get_stress_prediction as llm_get_stress_prediction,
    get_emergency_rescue as llm_get_emergency_rescue, 
    get_growth_forecast as llm_get_growth_forecast
)
from app.services.kindwise import identify_plant as identify_plant_service
from app.services.weather import get_weather as get_weather_service
from app.models import Plant, Species, CareLog, ChatMessage, Milestone
from sqlalchemy.orm import Session
import uuid


async def identify_plant(image_base64: str):
    from app.schemas import IdentifyResponse, IdentifySuggestion
    return await identify_plant_service(image_base64)


async def get_weather(lat: float, lon: float):
    return await get_weather_service(lat, lon)


# LLM functions
async def _build_plant_context(plant: Plant, species: Species, logs: List[CareLog], messages: List[ChatMessage]) -> dict:
    log_data = [
        {
            "type": log.type,
            "timestamp": log.timestamp.isoformat(),
            "notes": log.notes,
            "care_metadata": log.care_metadata,
        }
        for log in logs
    ]
    history_data = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
    return {
        "plant": {"nickname": plant.nickname, "age_days": (datetime.utcnow() - plant.acquired_date).days},
        "species": {
            "common_name": species.common_name,
            "water_frequency_days": species.water_frequency_days,
            "light_level": species.light_level,
            "temperature_min": species.temperature_min,
            "temperature_max": species.temperature_max,
            "notes": species.notes,
        },
        "logs": log_data,
        "history": history_data,
    }


async def chat_complete(plant_data: dict, species_data: dict, logs_data: list, history_data: list, user_message: str) -> str:
    return await llm_chat_complete(
        plant_data=plant_data,
        species_data=species_data,
        logs_data=logs_data,
        history_data=history_data,
        user_message=user_message,
    )


async def chat_stream(plant_data: dict, species_data: dict, logs_data: list, history_data: list, user_message: str) -> AsyncGenerator[str, None]:
    async for chunk in llm_chat_stream(
        plant_data=plant_data,
        species_data=species_data,
        logs_data=logs_data,
        history_data=history_data,
        user_message=user_message,
    ):
        yield chunk


async def get_survival_score(plant_data: dict, species_data: dict, logs_data: list):
    return await llm_get_survival_score(plant_data, species_data, logs_data)


async def get_stress_prediction(plant_data: dict, species_data: dict, logs_data: list, weather_data: dict):
    return await llm_get_stress_prediction(plant_data, species_data, logs_data, weather_data)


async def get_emergency_rescue(plant_data: dict, species_data: dict, symptoms: str, logs_data: list):
    return await llm_get_emergency_rescue(plant_data, species_data, symptoms, logs_data)


async def get_growth_forecast(plant_data: dict, species_data: dict, logs_data: list):
    return await llm_get_growth_forecast(plant_data, species_data, logs_data)


def _calculate_care_stats(plant: Plant) -> dict:
    """Calculate care statistics for a plant"""
    return {
        "days_since_water": 0,
        "days_since_fertilize": 0,
        "total_waterings": 0,
        "total_fertilizations": 0,
    }


def _create_auto_milestones(db: Session, plant: Plant, log: CareLog):
    """Create automatic milestones based on care log entries"""
    # Check for first watering
    if log.type == "water":
        water_count = db.query(CareLog).filter(
            CareLog.plant_id == plant.id,
            CareLog.type == "water"
        ).count()
        if water_count == 1:
            milestone = Milestone(
                id=str(uuid.uuid4()),
                plant_id=plant.id,
                type="custom",
                title="First Watering",
                description=f"First watering recorded for {plant.nickname}",
                date=datetime.utcnow(),
                severity="low",
            )
            db.add(milestone)
    
    # Check for first fertilizing
    if log.type == "fertilize":
        fert_count = db.query(CareLog).filter(
            CareLog.plant_id == plant.id,
            CareLog.type == "fertilize"
        ).count()
        if fert_count == 1:
            milestone = Milestone(
                id=str(uuid.uuid4()),
                plant_id=plant.id,
                type="custom",
                title="First Fertilizing",
                description=f"First fertilization recorded for {plant.nickname}",
                date=datetime.utcnow(),
                severity="low",
            )
            db.add(milestone)
    
    # Check for repotting
    if log.type == "repot":
        milestone = Milestone(
            id=str(uuid.uuid4()),
            plant_id=plant.id,
            type="repotted",
            title="Repotted",
            description=f"Repotted {plant.nickname}",
            date=datetime.utcnow(),
            severity="medium",
        )
        db.add(milestone)
    
    # Check for move
    if log.type == "move":
        milestone = Milestone(
            id=str(uuid.uuid4()),
            plant_id=plant.id,
            type="moved",
            title="Moved Location",
            description=f"Moved {plant.nickname} to new location",
            date=datetime.utcnow(),
            severity="low",
        )
        db.add(milestone)