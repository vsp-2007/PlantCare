from fastapi import APIRouter, HTTPException, Query

from app.services.weather import get_weather
from app.schemas import WeatherResponse

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/current", response_model=WeatherResponse)
async def current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    try:
        data = await get_weather(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(502, f"Weather API error: {str(e)}")