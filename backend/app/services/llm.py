import os
import json
import httpx
from typing import AsyncGenerator, List, Dict, Any
from app.schemas import (
    SurvivalScoreResponse, StressPredictionResponse, StressRisk,
    EmergencyRescueResponse, RescueStep, GrowthForecastResponse, GrowthMilestone
)


LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")


SYSTEM_PROMPT = """You are a plant doctor. For every response, structure as:
**Why:** Brief cause (1-2 sentences)
**What:** Diagnosis/observation
**How:** Actionable steps (numbered, specific)
Be concise. Use metric units. No fluff."""


async def _llm_chat(messages: list, stream: bool = False) -> str | AsyncGenerator[str, None]:
    """Call LLM API"""
    if not LLM_API_KEY:
        raise ValueError("LLM_API_KEY not configured")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{LLM_BASE_URL}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {LLM_API_KEY}",
            },
            json={
                "model": LLM_MODEL,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 1000,
                "stream": stream,
            },
        )
        response.raise_for_status()
        
        if stream:
            async def stream_generator():
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except:
                            pass
            return stream_generator()
        else:
            data = response.json()
            return data["choices"][0]["message"]["content"]


def _build_survival_prompt(plant_data: dict, species_data: dict, logs: list) -> list:
    days_since_water = plant_data.get("days_since_water", 0)
    days_since_fert = plant_data.get("days_since_fertilize", 0)
    water_freq = species_data.get("water_frequency_days", 7)
    fert_freq = species_data.get("fertilizer_frequency_days", 30)
    
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Species needs: water every {water_freq}d, fertilize every {fert_freq}d
Recent care: {logs[-5:] if logs else 'None'}
Days since water: {days_since_water}, since fertilize: {days_since_fert}
Return JSON: {{"score": 0-100, "factors": ["factor1", "factor2"], "urgent": boolean}}"""}
    ]


def _build_stress_prompt(plant_data: dict, species_data: dict, logs: list, weather: dict) -> list:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Species: water {species_data.get('water_frequency_days')}d, light {species_data.get('light_level')}, temp {species_data.get('temperature_min')}-{species_data.get('temperature_max')}°C
Recent logs: {logs[-5:] if logs else 'None'}
Current weather: {weather.get('current', {})}
Forecast: {weather.get('forecast', [])[:2]}
Return JSON: {{"risks": [{{"factor": "...", "severity": "low|medium|high", "timeframe": "..."}}]}}"""}
    ]


def _build_rescue_prompt(plant_data: dict, species_data: dict, symptoms: str, logs: list) -> list:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""EMERGENCY: {plant_data.get('nickname')} ({species_data.get('common_name')})
Symptoms: {symptoms}
Recent care: {logs[-5:] if logs else 'None'}
Species needs: water {species_data.get('water_frequency_days')}d, light {species_data.get('light_level')}
Return JSON: {{"steps": [{{"step": 1, "title": "...", "description": "..."}}]}}"""}
    ]


def _build_growth_prompt(plant_data: dict, species_data: dict, logs: list) -> list:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Age: {plant_data.get('age_days', 0)} days
Species growth: {species_data.get('notes', 'Standard')}
Recent care quality: {len(logs)} actions in last 30 days
Return JSON: {{"milestones": [{{"event": "...", "estimated_date": "YYYY-MM-DD", "confidence": 0.0-1.0}}]}}"""}
    ]


async def get_survival_score(plant_data: dict, species_data: dict, logs: list) -> SurvivalScoreResponse:
    messages = _build_survival_prompt(plant_data, species_data, logs)
    content = await _llm_chat(messages)
    try:
        data = json.loads(content)
        return SurvivalScoreResponse(**data)
    except:
        return SurvivalScoreResponse(score=50, factors=["Unable to analyze"], urgent=False)


async def get_stress_prediction(plant_data: dict, species_data: dict, logs: list, weather: dict) -> StressPredictionResponse:
    messages = _build_stress_prompt(plant_data, species_data, logs, weather)
    content = await _llm_chat(messages)
    try:
        data = json.loads(content)
        return StressPredictionResponse(risks=[StressRisk(**r) for r in data.get("risks", [])])
    except:
        return StressPredictionResponse(risks=[])


async def get_emergency_rescue(plant_data: dict, species_data: dict, symptoms: str, logs: list) -> EmergencyRescueResponse:
    messages = _build_rescue_prompt(plant_data, species_data, symptoms, logs)
    content = await _llm_chat(messages)
    try:
        data = json.loads(content)
        return EmergencyRescueResponse(steps=[RescueStep(**s) for s in data.get("steps", [])])
    except:
        return EmergencyRescueResponse(steps=[
            RescueStep(step=1, title="Assess", description="Check soil moisture and leaf condition"),
            RescueStep(step=2, title="Act", description="Address immediate issue (water/drain/shade)"),
            RescueStep(step=3, title="Monitor", description="Check again in 2 hours"),
        ])


async def get_growth_forecast(plant_data: dict, species_data: dict, logs: list) -> GrowthForecastResponse:
    messages = _build_growth_prompt(plant_data, species_data, logs)
    content = await _llm_chat(messages)
    try:
        data = json.loads(content)
        return GrowthForecastResponse(milestones=[GrowthMilestone(**m) for m in data.get("milestones", [])])
    except:
        return GrowthForecastResponse(milestones=[])


async def chat_complete(plant_data: dict, species_data: dict, logs_data: list, history_data: list, user_message: str) -> str:
    """Non-streaming chat completion"""
    context = f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Species: water {species_data.get('water_frequency_days')}d, light {species_data.get('light_level')}, temp {species_data.get('temperature_min')}-{species_data.get('temperature_max')}°C
Recent care: {logs_data[-3:] if logs_data else 'None'}
"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n" + context},
    ]
    for msg in history_data[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})
    
    return await _llm_chat(messages)


async def chat_stream(plant_data: dict, species_data: dict, logs_data: list, history_data: list, user_message: str) -> AsyncGenerator[str, None]:
    """Streaming chat completion"""
    context = f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Species: water {species_data.get('water_frequency_days')}d, light {species_data.get('light_level')}, temp {species_data.get('temperature_min')}-{species_data.get('temperature_max')}°C
Recent care: {logs_data[-3:] if logs_data else 'None'}
"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n" + context},
    ]
    for msg in history_data[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})
    
    async for chunk in await _llm_chat(messages, stream=True):
        yield chunk