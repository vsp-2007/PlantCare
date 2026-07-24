import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Plant, Species, CareLog, ChatMessage, Milestone
from app.schemas import (
    PlantCreate, PlantUpdate, PlantResponse,
    PlantPassportResponse, CareLogResponse, ChatMessageResponse, MilestoneResponse,
)

router = APIRouter(prefix="/plants", tags=["plants"])


@router.get("", response_model=list[PlantResponse])
def list_plants(
    species_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Plant)
    if species_id:
        q = q.filter(Plant.species_id == species_id)
    return q.all()


@router.post("", response_model=PlantResponse, status_code=201)
def create_plant(body: PlantCreate, db: Session = Depends(get_db)):
    species = db.query(Species).filter(Species.id == body.species_id).first()
    if not species:
        raise HTTPException(404, "Species not found")
        
    plant_id = body.id or str(uuid.uuid4())
    existing = db.query(Plant).filter(Plant.id == plant_id).first()
    if existing:
        raise HTTPException(409, "Plant with this ID already exists")
        
    data = body.model_dump()
    data["id"] = plant_id
    plant = Plant(**data)
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(plant_id: str, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    return plant


@router.put("/{plant_id}", response_model=PlantResponse)
def update_plant(plant_id: str, body: PlantUpdate, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(plant, key, val)
    db.commit()
    db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=204)
def delete_plant(plant_id: str, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    db.delete(plant)
    db.commit()
    return None


@router.get("/{plant_id}/passport", response_model=PlantPassportResponse)
def get_plant_passport(plant_id: str, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")

    care_logs = db.query(CareLog).filter(CareLog.plant_id == plant_id).order_by(CareLog.timestamp.desc()).limit(10).all()
    milestones = db.query(Milestone).filter(Milestone.plant_id == plant_id).order_by(Milestone.date.desc()).limit(10).all()
    chat = db.query(ChatMessage).filter(ChatMessage.plant_id == plant_id).order_by(ChatMessage.timestamp.desc()).limit(10).all()

    return PlantPassportResponse(
        plant=PlantResponse.model_validate(plant),
        species=plant.species,
        care_logs=[CareLogResponse.model_validate(c) for c in care_logs],
        milestones=[MilestoneResponse.model_validate(m) for m in milestones],
        chat_messages=[ChatMessageResponse.model_validate(m) for m in chat],
        total_care_logs=db.query(CareLog).filter(CareLog.plant_id == plant_id).count(),
        total_chat_messages=db.query(ChatMessage).filter(ChatMessage.plant_id == plant_id).count(),
        total_milestones=db.query(Milestone).filter(Milestone.plant_id == plant_id).count(),
    )