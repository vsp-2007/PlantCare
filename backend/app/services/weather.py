import os
import httpx
from app.core.config import get_settings
from app.schemas import WeatherResponse, WeatherCurrent, WeatherForecastDay


WEATHERAPI_KEY = os.getenv("WEATHERAPI_KEY", "")
WEATHERAPI_ENDPOINT = "https://api.weatherapi.com/v1"


async def get_weather(lat: float, lon: float) -> WeatherResponse:
    """Get current weather and 3-day forecast from WeatherAPI"""
    if not WEATHERAPI_KEY:
        raise ValueError("WEATHERAPI_KEY not configured")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{WEATHERAPI_ENDPOINT}/forecast.json",
            params={
                "key": WEATHERAPI_KEY,
                "q": f"{lat},{lon}",
                "days": 3,
                "aqi": "no",
                "alerts": "no",
            },
        )
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        forecast_days = data.get("forecast", {}).get("forecastday", [])
        
        return WeatherResponse(
            current=WeatherCurrent(
                temp_c=current.get("temp_c", 0),
                humidity=current.get("humidity", 0),
                condition_text=current.get("condition", {}).get("text", ""),
                icon=current.get("condition", {}).get("icon", ""),
                wind_kph=current.get("wind_kph", 0),
            ),
            forecast=[
                WeatherForecastDay(
                    date=day.get("date", ""),
                    max_temp_c=day.get("day", {}).get("maxtemp_c", 0),
                    min_temp_c=day.get("day", {}).get("mintemp_c", 0),
                    condition_text=day.get("day", {}).get("condition", {}).get("text", ""),
                    daily_chance_of_rain=day.get("day", {}).get("daily_chance_of_rain", 0),
                )
                for day in forecast_days
            ],
        )