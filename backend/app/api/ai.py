from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Plant, CareLog, Species
from app.schemas import (
    SurvivalScoreResponse, StressPredictionResponse,
    EmergencyRescueResponse, GrowthForecastResponse
)
from app.services.llm import (
    get_survival_score, get_stress_prediction,
    get_emergency_rescue, get_growth_forecast
)
from app.services.weather import get_weather

router = APIRouter(prefix="/ai", tags=["ai"])


def _get_plant_info(plant: Plant) -> dict:
    return {
        "nickname": plant.nickname,
        "species_name": plant.species.common_name if plant.species else "Unknown",
        "scientific_name": plant.species.scientific_name if plant.species else "Unknown",
        "location": plant.location,
        "acquired_date": plant.acquired_date.isoformat() if plant.acquired_date else None,
        "light_level": plant.species.light_level if plant.species else "medium",
        "water_frequency_days": plant.species.water_frequency_days if plant.species else 7,
        "soil_type": plant.species.soil_type if plant.species else "general",
        "temperature_min": plant.species.temperature_min if plant.species else 15,
        "temperature_max": plant.species.temperature_max if plant.species else 30,
    }


def _get_species_info(plant: Plant) -> dict:
    if not plant.species:
        return {}
    return {
        "common_name": plant.species.common_name,
        "scientific_name": plant.species.scientific_name,
        "water_frequency_days": plant.species.water_frequency_days,
        "fertilizer_frequency_days": plant.species.fertilizer_frequency_days,
        "light_level": plant.species.light_level,
        "temperature_min": plant.species.temperature_min,
        "temperature_max": plant.species.temperature_max,
        "notes": plant.species.notes,
    }


def _get_care_history(plant_id: str, db: Session) -> list[dict]:
    logs = (
        db.query(CareLog)
        .filter(CareLog.plant_id == plant_id)
        .order_by(CareLog.timestamp.desc())
        .limit(30)
        .all()
    )
    return [
        {"type": l.type, "timestamp": l.timestamp.isoformat(), "notes": l.notes}
        for l in logs
    ]


@router.post("/survival-score", response_model=SurvivalScoreResponse)
async def get_survival_score_endpoint(plant_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    plant_info = _get_plant_info(plant)
    species_info = _get_species_info(plant)
    logs = _get_care_history(plant_id, db)
    
    # Calculate care stats
    from datetime import datetime
    now = datetime.utcnow()
    last_water = next((l for l in logs if l["type"] == "water"), None)
    last_fert = next((l for l in logs if l["type"] == "fertilize"), None)
    days_since_water = (now - datetime.fromisoformat(last_water["timestamp"])).days if last_water else 999
    days_since_fert = (now - datetime.fromisoformat(last_fert["timestamp"])).days if last_fert else 999
    age_days = (now - plant.acquired_date).days
    
    plant_data = {"nickname": plant.nickname, "days_since_water": days_since_water, "days_since_fertilize": days_since_fert, "age_days": age_days}
    try:
        result = await get_survival_score(plant_data, species_info, logs)
        return result
    except Exception as e:
        raise HTTPException(502, f"AI service error: {str(e)}")


@router.post("/stress-prediction", response_model=StressPredictionResponse)
async def get_stress_prediction_endpoint(plant_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    plant_info = _get_plant_info(plant)
    species_info = _get_species_info(plant)
    logs = _get_care_history(plant_id, db)
    
    # Get local weather data
    weather_data = {"current": {}, "forecast": []}
    try:
        weather = await get_weather(28.6139, 77.2090)
        weather_data = {"current": weather.current.model_dump(), "forecast": [f.model_dump() for f in weather.forecast]}
    except:
        pass
    
    plant_data = {"nickname": plant.nickname, "age_days": (datetime.utcnow() - plant.acquired_date).days}
    try:
        result = await get_stress_prediction(plant_data, species_info, logs, weather_data)
        return result
    except Exception as e:
        raise HTTPException(502, f"AI service error: {str(e)}")


@router.post("/emergency-rescue", response_model=EmergencyRescueResponse)
async def get_emergency_rescue_endpoint(
    plant_id: str = Body(..., embed=True),
    symptoms: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    plant_info = _get_plant_info(plant)
    species_info = _get_species_info(plant)
    logs = _get_care_history(plant_id, db)
    try:
        result = await get_emergency_rescue(plant_info, species_info, symptoms, logs)
        return result
    except Exception as e:
        raise HTTPException(502, f"AI service error: {str(e)}")


@router.post("/growth-forecast", response_model=GrowthForecastResponse)
async def get_growth_forecast_endpoint(plant_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    plant_info = _get_plant_info(plant)
    species_info = _get_species_info(plant)
    logs = _get_care_history(plant_id, db)
    
    plant_data = {"nickname": plant.nickname, "age_days": (datetime.utcnow() - plant.acquired_date).days}
    try:
        result = await get_growth_forecast(plant_data, species_info, logs)
        return result
    except Exception as e:
        raise HTTPException(502, f"AI service error: {str(e)}")