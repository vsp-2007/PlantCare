import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Milestone, Plant
from app.schemas import MilestoneCreate, MilestoneResponse

router = APIRouter(prefix="/plants", tags=["milestones"])


@router.get("/{plant_id}/milestones", response_model=list[MilestoneResponse])
def list_milestones(plant_id: str, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    return (
        db.query(Milestone)
        .filter(Milestone.plant_id == plant_id)
        .order_by(Milestone.date.desc())
        .all()
    )


@router.post("/{plant_id}/milestones", response_model=MilestoneResponse, status_code=201)
def create_milestone(plant_id: str, body: MilestoneCreate, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    if body.plant_id != plant_id:
        raise HTTPException(400, "plant_id mismatch")
    
    milestone_id = body.id or str(uuid.uuid4())
    existing = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if existing:
        raise HTTPException(409, "Milestone with this ID already exists")
        
    data = body.model_dump()
    data["id"] = milestone_id
    milestone = Milestone(**data)
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone