from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SpeciesBase(BaseModel):
    common_name: str
    scientific_name: str
    water_frequency_days: int
    light_level: str
    soil_type: str
    fertilizer_frequency_days: int
    humidity_preference: str
    temperature_min: float
    temperature_max: float
    notes: Optional[str] = None


class SpeciesCreate(SpeciesBase):
    id: str


class SpeciesResponse(SpeciesBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SpeciesSearchResult(BaseModel):
    id: str
    common_name: str
    scientific_name: str
    light_level: str
    water_frequency_days: int


class PlantBase(BaseModel):
    nickname: str
    species_id: str
    location: str
    acquired_date: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None


class PlantCreate(PlantBase):
    id: str


class PlantUpdate(BaseModel):
    nickname: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None


class PlantResponse(PlantBase):
    id: str
    species: Optional[SpeciesResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CareLogBase(BaseModel):
    type: str
    timestamp: datetime
    notes: Optional[str] = None
    care_metadata: Optional[dict] = None


class CareLogCreate(BaseModel):
    type: str
    timestamp: datetime
    notes: Optional[str] = None
    care_metadata: Optional[dict] = None


class CareLogResponse(CareLogBase):
    id: str
    plant_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CareLogPaginated(BaseModel):
    items: list[CareLogResponse]
    total: int
    page: int
    page_size: int


class ChatMessageCreate(BaseModel):
    plant_id: str
    role: str = Field(default="user")
    content: str


class ChatMessageResponse(BaseModel):
    id: str
    plant_id: str
    role: str
    content: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str


class MilestoneBase(BaseModel):
    plant_id: str
    type: str
    title: str
    description: str
    date: datetime
    severity: Optional[str] = None


class MilestoneCreate(MilestoneBase):
    id: str


class MilestoneResponse(MilestoneBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class KindwiseIdentifyRequest(BaseModel):
    image_base64: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class KindwiseUsageResponse(BaseModel):
    month: str
    count: int

    model_config = {"from_attributes": True}


class PlantPassportResponse(BaseModel):
    plant: PlantResponse
    species: SpeciesResponse
    care_logs: list[CareLogResponse]
    milestones: list[MilestoneResponse]
    chat_messages: list[ChatMessageResponse]
    total_care_logs: int
    total_chat_messages: int
    total_milestones: int


class WeatherCurrentResponse(BaseModel):
    temp_c: float
    condition: str
    humidity: int
    wind_kph: float
    feelslike_c: float
    uv: float
    location: str


class AISurvivalScoreRequest(BaseModel):
    plant_id: str


class AISurvivalScoreResponse(BaseModel):
    score: float
    analysis: str
    recommendations: list[str]


class AIStressPredictionRequest(BaseModel):
    plant_id: str


class AIStressPredictionResponse(BaseModel):
    stress_level: str
    probability: float
    factors: list[str]
    remediation: list[str]


class AIEmergencyRescueRequest(BaseModel):
    plant_id: str
    symptoms: str


class AIEmergencyRescueResponse(BaseModel):
    diagnosis: str
    urgency: str
    steps: list[str]
    recovery_time_days: int


class AIGrowthForecastRequest(BaseModel):
    plant_id: str
    months: int = Field(default=3, ge=1, le=12)


class AIGrowthForecastResponse(BaseModel):
    projected_height_cm: float
    projected_health: str
    milestones_expected: list[str]
    care_recommendations: list[str]