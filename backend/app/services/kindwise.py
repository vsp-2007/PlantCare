import os
import httpx
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import KindwiseUsage


KINDWISE_BASE_URL = "https://crop.kindwise.com/api/v1"


async def identify_plant(image_base64: str) -> dict:
    """Identify plant using Kindwise API"""
    settings = get_settings()
    
    month_key = datetime.utcnow().strftime("%Y-%m")
    
    # We'll use a simple in-memory counter for the demo since we don't have DB session here
    # In production, you'd use the DB session
    if not settings.KINDWISE_KEY:
        raise ValueError("KINDWISE_KEY not configured")
    
    payload = {"images": [f"data:image/jpeg;base64,{image_base64}"]}
    
    headers = {"Api-Key": settings.KINDWISE_KEY, "Content-Type": "application/json"}
    
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{KINDWISE_BASE_URL}/identification",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        data = resp.json()
    
    suggestions = data.get("result", {}).get("classification", {}).get("suggestions", [])
    top = suggestions[0] if suggestions else None
    
    return {
        "result": {
            "classification": {
                "suggestions": suggestions,
            }
        },
        "top_match": {
            "name": top.get("name") if top else None,
            "probability": top.get("probability") if top else None,
            "details": top.get("details", {}) if top else {},
        }
        if top
        else None,
    }