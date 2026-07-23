from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Float, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship

from app.db.database import Base


class Species(Base):
    __tablename__ = "species"

    id = Column(String, primary_key=True)
    common_name = Column(String(256), nullable=False)
    scientific_name = Column(String(256), nullable=False)
    water_frequency_days = Column(Integer, nullable=False)
    light_level = Column(String(32), nullable=False)
    soil_type = Column(String(256), nullable=False)
    fertilizer_frequency_days = Column(Integer, nullable=False)
    humidity_preference = Column(String(32), nullable=False)
    temperature_min = Column(Float, nullable=False)
    temperature_max = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plants = relationship("Plant", back_populates="species")


class Plant(Base):
    __tablename__ = "plants"

    id = Column(String, primary_key=True)
    nickname = Column(String(128), nullable=False)
    species_id = Column(String, ForeignKey("species.id"), nullable=False)
    location = Column(String(256), nullable=False)
    acquired_date = Column(DateTime, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    photo_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    species = relationship("Species", back_populates="plants")
    care_logs = relationship("CareLog", back_populates="plant", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="plant", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="plant", cascade="all, delete-orphan")


class CareLog(Base):
    __tablename__ = "care_logs"

    id = Column(String, primary_key=True)
    plant_id = Column(String, ForeignKey("plants.id"), nullable=False, index=True)
    type = Column(String(32), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    care_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plant = relationship("Plant", back_populates="care_logs")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    plant_id = Column(String, ForeignKey("plants.id"), nullable=False, index=True)
    role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)

    plant = relationship("Plant", back_populates="chat_messages")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String, primary_key=True)
    plant_id = Column(String, ForeignKey("plants.id"), nullable=False, index=True)
    type = Column(String(32), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    severity = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plant = relationship("Plant", back_populates="milestones")


class KindwiseUsage(Base):
    __tablename__ = "kindwise_usage"

    month = Column(String(7), primary_key=True)  # YYYY-MM
    count = Column(Integer, default=0)