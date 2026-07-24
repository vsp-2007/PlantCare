import os
import json
import httpx
from typing import AsyncGenerator, List, Dict, Any
from app.schemas import (
    SurvivalScoreResponse, StressPredictionResponse, StressRisk,
    EmergencyRescueResponse, RescueStep, GrowthForecastResponse, GrowthMilestone
)

LLM_API_KEY = os.getenv("LLM_API_KEY", "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")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://integrate.api.nvidia.com/v1").rstrip("/")
LLM_MODEL = os.getenv("LLM_MODEL", "nvidia/nemotron-3-nano-30b-a3b")


SYSTEM_PROMPT = """You are PlantAI Doctor, an expert botanical specialist in PlantCare.
STRICT DOMAIN SCOPING RULE: You ONLY answer questions related to plants, botanical health, gardening, soil, watering, sunlight, plant care, pests, vegetation, and agriculture.
If the user asks about ANY unrelated topic (such as general programming, sports, movies, mathematics, personal finance, or non-botanical topics), politely decline by stating: "I am PlantAI Doctor, specialized exclusively in plant care, botanical diagnostics, and gardening. I cannot assist with non-plant topics."

For plant-related queries, structure responses concisely as:
**Why:** Cause / Explanation (1-2 sentences)
**What:** Diagnosis or Observation
**How:** Actionable steps (numbered, specific)
Be concise, accurate, and use metric units. No fluff."""


async def _llm_chat(messages: list, stream: bool = False) -> str | AsyncGenerator[str, None]:
    """Call LLM API using NVIDIA Nemotron endpoint with thinking and domain enforcement"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LLM_API_KEY}",
    }
    
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": 1,
        "top_p": 0.95,
        "max_tokens": 16384,
        "extra_body": {
            "chat_template_kwargs": {"enable_thinking": True},
            "reasoning_budget": 16384,
        },
        "stream": stream,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            if stream:
                async def stream_generator():
                    try:
                        async with client.stream("POST", f"{LLM_BASE_URL}/chat/completions", headers=headers, json=payload) as response:
                            response.raise_for_status()
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    data = line[6:].strip()
                                    if data == "[DONE]":
                                        break
                                    try:
                                        chunk = json.loads(data)
                                        if not chunk.get("choices"):
                                            continue
                                        delta = chunk["choices"][0].get("delta", {})
                                        reasoning = delta.get("reasoning_content")
                                        content = delta.get("content")
                                        if reasoning:
                                            yield reasoning
                                        if content is not None:
                                            yield content
                                    except Exception:
                                        pass
                    except Exception as err:
                        print(f"LLM streaming error: {err}")
                        yield "As a digital plant doctor, I recommend inspecting soil moisture 2 inches deep and ensuring bright, indirect light."

                return stream_generator()
            else:
                response = await client.post(f"{LLM_BASE_URL}/chat/completions", headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                choice = data["choices"][0]
                message = choice.get("message", {})
                content = message.get("content", "")
                reasoning = message.get("reasoning_content", "")
                if content:
                    return content
                return reasoning or "No response content returned."
    except Exception as err:
        print(f"LLM API call error: {err}")
        return "As a digital plant doctor, I recommend inspecting soil moisture 2 inches deep and ensuring bright, indirect light."


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
Return valid JSON only: {{"score": 85, "factors": ["Water frequency optimal", "Soil moisture adequate"], "urgent": false}}"""}
    ]


def _build_stress_prompt(plant_data: dict, species_data: dict, logs: list, weather: dict) -> list:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Species: water {species_data.get('water_frequency_days')}d, light {species_data.get('light_level')}, temp {species_data.get('temperature_min')}-{species_data.get('temperature_max')}°C
Recent logs: {logs[-5:] if logs else 'None'}
Current weather: {weather.get('current', {})}
Forecast: {weather.get('forecast', [])[:2]}
Return valid JSON only: {{"risks": [{{"factor": "Low humidity", "severity": "low", "timeframe": "Next 3 days"}}]}}"""}
    ]


def _build_rescue_prompt(plant_data: dict, species_data: dict, symptoms: str, logs: list) -> list:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""EMERGENCY: {plant_data.get('nickname')} ({species_data.get('common_name')})
Symptoms: {symptoms}
Recent care: {logs[-5:] if logs else 'None'}
Species needs: water {species_data.get('water_frequency_days')}d, light {species_data.get('light_level')}
Return valid JSON only: {{"steps": [{{"step": 1, "title": "Check Soil Moisture", "description": "Probe 2 inches into soil"}}]}}"""}
    ]


def _build_growth_prompt(plant_data: dict, species_data: dict, logs: list) -> list:
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""Plant: {plant_data.get('nickname')} ({species_data.get('common_name')})
Age: {plant_data.get('age_days', 0)} days
Species growth: {species_data.get('notes', 'Standard')}
Recent care quality: {len(logs)} actions in last 30 days
Return valid JSON only: {{"milestones": [{{"event": "New Leaf Emergence", "estimated_date": "2026-08-01", "confidence": 0.85}}]}}"""}
    ]


async def get_survival_score(plant_data: dict, species_data: dict, logs: list) -> SurvivalScoreResponse:
    messages = _build_survival_prompt(plant_data, species_data, logs)
    try:
        content = await _llm_chat(messages)
        if isinstance(content, str):
            # Clean possible markdown block markers
            cleaned = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            return SurvivalScoreResponse(**data)
    except Exception as e:
        print(f"Error parsing survival score LLM output: {e}")
    return SurvivalScoreResponse(score=85.0, factors=["Care routine maintained", "Environmental conditions stable"], urgent=False)


async def get_stress_prediction(plant_data: dict, species_data: dict, logs: list, weather: dict) -> StressPredictionResponse:
    messages = _build_stress_prompt(plant_data, species_data, logs, weather)
    try:
        content = await _llm_chat(messages)
        if isinstance(content, str):
            cleaned = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            return StressPredictionResponse(risks=[StressRisk(**r) for r in data.get("risks", [])])
    except Exception as e:
        print(f"Error parsing stress prediction LLM output: {e}")
    return StressPredictionResponse(risks=[StressRisk(factor="Humidity variance", severity="low", timeframe="7 days")])


async def get_emergency_rescue(plant_data: dict, species_data: dict, symptoms: str, logs: list) -> EmergencyRescueResponse:
    messages = _build_rescue_prompt(plant_data, species_data, symptoms, logs)
    try:
        content = await _llm_chat(messages)
        if isinstance(content, str):
            cleaned = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            return EmergencyRescueResponse(steps=[RescueStep(**s) for s in data.get("steps", [])])
    except Exception as e:
        print(f"Error parsing emergency rescue LLM output: {e}")
    return EmergencyRescueResponse(steps=[
        RescueStep(step=1, title="Assess Root Zone", description="Check top 2 inches of soil moisture and drain excess water"),
        RescueStep(step=2, title="Adjust Lighting", description="Move plant away from direct harsh sunlight into bright indirect light"),
        RescueStep(step=3, title="Monitor Telemetry", description="Re-check foliage turgidity and humidity levels in 24 hours"),
    ])


async def get_growth_forecast(plant_data: dict, species_data: dict, logs: list) -> GrowthForecastResponse:
    messages = _build_growth_prompt(plant_data, species_data, logs)
    try:
        content = await _llm_chat(messages)
        if isinstance(content, str):
            cleaned = content.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            return GrowthForecastResponse(milestones=[GrowthMilestone(**m) for m in data.get("milestones", [])])
    except Exception as e:
        print(f"Error parsing growth forecast LLM output: {e}")
    return GrowthForecastResponse(milestones=[
        GrowthMilestone(event="Secondary Fenestration Leaf", estimated_date="2026-08-15", confidence=0.90)
    ])


async def chat_complete(plant_data: dict, species_data: dict, logs_data: list, history_data: list, user_message: str) -> str:
    """Non-streaming chat completion with strict domain scoping"""
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
    
    result = await _llm_chat(messages)
    if isinstance(result, str):
        return result
    return "PlantAI Doctor processed your query."


async def chat_response(plant_info: dict, conversation: list, user_message: str) -> str:
    """Convenience alias function for plant chat response"""
    return await chat_complete(
        plant_data=plant_info,
        species_data=plant_info.get("care_info", {}),
        logs_data=[],
        history_data=conversation,
        user_message=user_message
    )


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
    
    stream_gen = await _llm_chat(messages, stream=True)
    if not isinstance(stream_gen, str):
        async for chunk in stream_gen:
            yield chunk