from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from enum import Enum


# Enums
class CareType(str, Enum):
    WATER = "water"
    FERTILIZE = "fertilize"
    PRUNE = "prune"
    REPOT = "repot"
    INSPECT = "inspect"
    MOVE = "move"


class MilestoneType(str, Enum):
    FIRST_SPROUT = "first_sprout"
    FIRST_BLOOM = "first_bloom"
    REPOTTED = "repotted"
    MOVED = "moved"
    STRESS_RECOVERY = "stress_recovery"
    CUSTOM = "custom"


class MilestoneSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class LightLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    DIRECT = "direct"


class HumidityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# Species Schemas
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

    model_config = {"from_attributes": True}


# Plant Schemas
class PlantBase(BaseModel):
    nickname: str
    species_id: str
    location: str
    acquired_date: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None


class PlantCreate(PlantBase):
    id: Optional[str] = None


class PlantUpdate(BaseModel):
    nickname: Optional[str] = None
    species_id: Optional[str] = None
    location: Optional[str] = None
    acquired_date: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None


class PlantResponse(PlantBase):
    id: str
    species: Optional[SpeciesResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Care Log Schemas
class CareLogBase(BaseModel):
    type: str
    timestamp: datetime
    notes: Optional[str] = None
    care_metadata: Optional[Dict[str, Any]] = None


class CareLogCreate(CareLogBase):
    pass


class CareLogResponse(CareLogBase):
    id: str
    plant_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CareLogPage(BaseModel):
    items: List[CareLogResponse]
    total: int
    page: int
    page_size: int

    model_config = {"from_attributes": True}


CareLogPaginated = CareLogPage


# Chat Schemas
class ChatMessageBase(BaseModel):
    role: str
    content: str


class ChatMessageCreate(BaseModel):
    plant_id: Optional[str] = None
    role: str = "user"
    content: str


class ChatMessageResponse(ChatMessageBase):
    id: str
    plant_id: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str


# Milestone Schemas
class MilestoneBase(BaseModel):
    plant_id: str
    type: str
    title: str
    description: str
    date: datetime
    severity: Optional[str] = None


class MilestoneCreate(MilestoneBase):
    id: Optional[str] = None


class MilestoneResponse(MilestoneBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Vision / Identify Schemas
class IdentifyRequest(BaseModel):
    image_base64: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class IdentifySuggestion(BaseModel):
    scientific_name: str
    common_name: str
    confidence: float
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class IdentifyResponse(BaseModel):
    suggestions: List[IdentifySuggestion]


# Weather Schemas
class WeatherCurrent(BaseModel):
    temp_c: float
    humidity: int
    condition_text: str
    icon: Optional[str] = "sun"
    wind_kph: float


class WeatherForecastDay(BaseModel):
    date: str
    max_temp_c: float
    min_temp_c: float
    condition_text: str
    daily_chance_of_rain: int


class WeatherResponse(BaseModel):
    current: WeatherCurrent
    forecast: List[WeatherForecastDay]


# AI Service Schemas
class SurvivalScoreResponse(BaseModel):
    score: float = Field(ge=0, le=100)
    factors: List[str]
    urgent: bool = False
    analysis: Optional[str] = None
    recommendations: Optional[List[str]] = None


class StressRisk(BaseModel):
    factor: str
    severity: str  # low, medium, high
    timeframe: str


class StressPredictionResponse(BaseModel):
    risks: List[StressRisk]
    stress_level: Optional[str] = None
    probability: Optional[float] = None
    factors: Optional[List[str]] = None
    remediation: Optional[List[str]] = None


class RescueStep(BaseModel):
    step: int
    title: str
    description: str


class EmergencyRescueResponse(BaseModel):
    steps: List[RescueStep]
    diagnosis: Optional[str] = None
    urgency: Optional[str] = None
    recovery_time_days: Optional[int] = None


class GrowthMilestone(BaseModel):
    event: str
    estimated_date: str
    confidence: float


class GrowthForecastResponse(BaseModel):
    milestones: List[GrowthMilestone]
    projected_height_cm: Optional[float] = None
    projected_health: Optional[str] = None
    milestones_expected: Optional[List[str]] = None
    care_recommendations: Optional[List[str]] = None


# Passport Schema
class PlantPassportResponse(BaseModel):
    plant: PlantResponse
    species: SpeciesResponse
    care_logs: List[CareLogResponse]
    milestones: List[MilestoneResponse]
    chat_messages: List[ChatMessageResponse]
    total_care_logs: int
    total_chat_messages: int
    total_milestones: int

    model_config = {"from_attributes": True}


PlantPassport = PlantPassportResponse