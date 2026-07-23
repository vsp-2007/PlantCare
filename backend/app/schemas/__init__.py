from datetime import datetime
from typing import Optional, List
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


# Species
class SpeciesBase(BaseModel):
    id: str
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
    created_at: datetime

    class Config:
        from_attributes = True


class SpeciesResponse(SpeciesBase):
    pass


class SpeciesCreate(BaseModel):
    id: str
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


# Plant
class PlantBase(BaseModel):
    nickname: str
    species_id: str
    location: str
    acquired_date: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None


class PlantCreate(PlantBase):
    pass


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
    created_at: datetime
    updated_at: datetime
    species: Optional[SpeciesResponse] = None

    class Config:
        from_attributes = True


# Care Log
class CareLogBase(BaseModel):
    type: CareType
    timestamp: datetime
    notes: Optional[str] = None
    care_metadata: Optional[dict] = None


class CareLogCreate(BaseModel):
    type: CareType
    timestamp: datetime
    notes: Optional[str] = None
    care_metadata: Optional[dict] = None


class CareLogResponse(CareLogBase):
    id: str
    plant_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class CareLogPage(BaseModel):
    items: List[CareLogResponse]
    total: int
    page: int
    page_size: int


# Chat
class ChatMessageBase(BaseModel):
    role: str  # user, assistant
    content: str


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(ChatMessageBase):
    id: str
    plant_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


# Milestone
class MilestoneBase(BaseModel):
    type: MilestoneType
    title: str
    description: str
    date: datetime
    severity: Optional[MilestoneSeverity] = None


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneResponse(MilestoneBase):
    id: str
    plant_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Vision
class IdentifyRequest(BaseModel):
    image_base64: str


class IdentifySuggestion(BaseModel):
    scientific_name: str
    common_name: str
    confidence: float
    details: Optional[dict] = None


class IdentifyResponse(BaseModel):
    suggestions: List[IdentifySuggestion]


# Weather
class WeatherCurrent(BaseModel):
    temp_c: float
    humidity: int
    condition_text: str
    icon: str
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


# AI Responses
class SurvivalScoreResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    factors: List[str]
    urgent: bool


class StressRisk(BaseModel):
    factor: str
    severity: str  # low, medium, high
    timeframe: str


class StressPredictionResponse(BaseModel):
    risks: List[StressRisk]


class RescueStep(BaseModel):
    step: int
    title: str
    description: str


class EmergencyRescueResponse(BaseModel):
    steps: List[RescueStep]


class GrowthMilestone(BaseModel):
    event: str
    estimated_date: str
    confidence: float


class GrowthForecastResponse(BaseModel):
    milestones: List[GrowthMilestone]


# Passport
class PlantPassport(BaseModel):
    plant: PlantResponse
    care_logs: List[CareLogResponse]
    milestones: List[MilestoneResponse]
    chat_history: List[ChatMessageResponse]
    generated_at: datetime


# Pagination
class PageParams(BaseModel):
    page: int = 1
    page_size: int = 20