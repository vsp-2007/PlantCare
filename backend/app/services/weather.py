import os
import time
import httpx
from app.core.config import get_settings
from app.schemas import WeatherResponse, WeatherCurrent, WeatherForecastDay

WEATHERAPI_ENDPOINT = "https://api.weatherapi.com/v1"

# Cache for rate-limiting weather API calls (max 3 calls per hour = 20 min TTL per location)
_WEATHER_CACHE = {}
_CACHE_TTL = 1200  # 20 minutes in seconds


async def get_weather(lat: float, lon: float) -> WeatherResponse:
    """Get current weather and 3-day forecast from WeatherAPI with 20-min caching (max 3 calls/hr)"""
    settings = get_settings()
    api_key = settings.WEATHERAPI_KEY or os.getenv("WEATHERAPI_KEY", "32bd1bfa43294eadb7e162102252702")
    
    cache_key = f"{round(lat, 2)},{round(lon, 2)}"
    now = time.time()
    
    # Check cache first for rate limiting
    if cache_key in _WEATHER_CACHE:
        cached_time, cached_data = _WEATHER_CACHE[cache_key]
        if now - cached_time < _CACHE_TTL:
            return cached_data

    if not api_key:
        return WeatherResponse(
            current=WeatherCurrent(
                temp_c=22.5,
                humidity=58,
                condition_text="Partly Cloudy",
                icon="sun",
                wind_kph=12.0
            ),
            forecast=[
                WeatherForecastDay(
                    date="2026-07-24",
                    max_temp_c=25.0,
                    min_temp_c=18.0,
                    condition_text="Partly Cloudy",
                    daily_chance_of_rain=10
                ),
                WeatherForecastDay(
                    date="2026-07-25",
                    max_temp_c=26.0,
                    min_temp_c=19.0,
                    condition_text="Sunny",
                    daily_chance_of_rain=0
                ),
                WeatherForecastDay(
                    date="2026-07-26",
                    max_temp_c=24.0,
                    min_temp_c=17.0,
                    condition_text="Light Rain",
                    daily_chance_of_rain=40
                )
            ]
        )
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{WEATHERAPI_ENDPOINT}/forecast.json",
                params={
                    "key": api_key,
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
            
            res = WeatherResponse(
                current=WeatherCurrent(
                    temp_c=current.get("temp_c", 22.0),
                    humidity=current.get("humidity", 55),
                    condition_text=current.get("condition", {}).get("text", "Clear"),
                    icon=current.get("condition", {}).get("icon", "sun"),
                    wind_kph=current.get("wind_kph", 10.0),
                ),
                forecast=[
                    WeatherForecastDay(
                        date=day.get("date", ""),
                        max_temp_c=day.get("day", {}).get("maxtemp_c", 25.0),
                        min_temp_c=day.get("day", {}).get("mintemp_c", 18.0),
                        condition_text=day.get("day", {}).get("condition", {}).get("text", "Clear"),
                        daily_chance_of_rain=day.get("day", {}).get("daily_chance_of_rain", 0),
                    )
                    for day in forecast_days
                ],
            )
            # Store in cache
            _WEATHER_CACHE[cache_key] = (now, res)
            return res
    except Exception as e:
        print(f"Weather API error: {e}")
        fallback = WeatherResponse(
            current=WeatherCurrent(
                temp_c=22.0,
                humidity=55,
                condition_text="Mild",
                icon="sun",
                wind_kph=10.0
            ),
            forecast=[]
        )
        return fallback