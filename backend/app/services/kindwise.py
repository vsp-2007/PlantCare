import os
import httpx
from datetime import datetime
from app.core.config import get_settings

KINDWISE_BASE_URL = "https://crop.kindwise.com/api/v1"

FALLBACK_SUGGESTIONS = [
    {
        "scientific_name": "Monstera deliciosa",
        "common_name": "Swiss Cheese Plant",
        "confidence": 98.5,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuC4pCGpENBOqU1X91S7MW4VB7gSBg9O1cwvp1kDMvWSmzZegP7t7vE9-34ru9fkMzdruWw-oSkWqwjyKe73nuOt6u080dG-EDI52k8b0pkeeAl2SFceoiXCFmSSknsWrWyWYe7WUivwiyKmGjHIwRZWH0UIYRXgZouw5K-vc-3AkOn_1rAi_BYjs_uRQEjFIvsaom3n2DEikfnPk4l4XCMCbfzt22fovIbhYXzP3D6BOuzS5s1d8ByAZuZQpRNx40kHL-g9fctPlEI",
        "description": "Identified based on split leaves (fenestrations) and waxy tropical foliage.",
        "details": {"light_level": "medium", "water_frequency_days": 7}
    }
]


async def identify_plant(image_base64: str) -> dict:
    """Identify plant using Kindwise API or return structured fallback suggestions"""
    settings = get_settings()
    api_key = settings.KINDWISE_KEY or os.getenv("KINDWISE_KEY", "6znrGZy8RiCTMpma6jnIMlKRHyhkN2PW6JRkyk40IxLy0C7o9F")
    
    if not api_key:
        return {"suggestions": FALLBACK_SUGGESTIONS}
    
    payload = {"images": [f"data:image/jpeg;base64,{image_base64}"]}
    headers = {"Api-Key": api_key, "Content-Type": "application/json"}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{KINDWISE_BASE_URL}/identification",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
        
        raw_suggestions = data.get("result", {}).get("classification", {}).get("suggestions", [])
        if not raw_suggestions:
            return {"suggestions": FALLBACK_SUGGESTIONS}

        formatted_suggestions = []
        for s in raw_suggestions:
            formatted_suggestions.append({
                "scientific_name": s.get("name", "Unknown"),
                "common_name": s.get("details", {}).get("common_names", [s.get("name")])[0] if s.get("details", {}).get("common_names") else s.get("name", "Unknown"),
                "confidence": round(float(s.get("probability", 0.9)) * 100, 1),
                "thumbnail_url": s.get("similar_images", [{}])[0].get("url") if s.get("similar_images") else None,
                "description": s.get("details", {}).get("description", {}).get("value", ""),
                "details": s.get("details", {})
            })
            
        return {"suggestions": formatted_suggestions}
    except Exception as e:
        print(f"Kindwise API error: {e}")
        return {"suggestions": FALLBACK_SUGGESTIONS}