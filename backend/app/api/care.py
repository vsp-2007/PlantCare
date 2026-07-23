from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db
from app.models import CareLog, Plant, Milestone
from app.schemas import CareLogCreate, CareLogResponse, CareLogPage


def _create_auto_milestones(db: Session, plant: Plant, care_log: CareLog):
    """Auto-create milestones based on care log"""
    now = datetime.utcnow()
    existing_types = {m.type for m in plant.milestones}
    
    # First watering
    if care_log.type == "water" and "first_sprout" not in existing_types:
        water_count = db.query(CareLog).filter(
            CareLog.plant_id == plant.id, CareLog.type == "water"
        ).count()
        if water_count == 1:
            milestone = Milestone(
                id=str(uuid.uuid4()),
                plant_id=plant.id,
                type="first_sprout",
                title="First Watering",
                description=f"First watering recorded for {plant.nickname}",
                date=now,
                severity="low",
            )
            db.add(milestone)
    
    # First fertilizing
    if care_log.type == "fertilize" and "first_bloom" not in existing_types:
        fert_count = db.query(CareLog).filter(
            CareLog.plant_id == plant.id, CareLog.type == "fertilize"
        ).count()
        if fert_count == 1:
            milestone = Milestone(
                id=str(uuid.uuid4()),
                plant_id=plant.id,
                type="first_bloom",
                title="First Fertilizing",
                description=f"First fertilizing recorded for {plant.nickname}",
                date=now,
                severity="low",
            )
            db.add(milestone)
    
    # Repotting
    if care_log.type == "repot":
        pot_size = care_log.care_metadata.get("pot_size", "new pot") if care_log.care_metadata else "new pot"
        milestone = Milestone(
            id=str(uuid.uuid4()),
            plant_id=plant.id,
            type="repotted",
            title="Repotted",
            description=f"Repotted to {pot_size}",
            date=now,
            severity="medium",
        )
        db.add(milestone)
    
    # Moving
    if care_log.type == "move":
        from_loc = care_log.care_metadata.get("from_location", "previous location") if care_log.care_metadata else "previous location"
        to_loc = care_log.care_metadata.get("to_location", plant.location) if care_log.care_metadata else plant.location
        milestone = Milestone(
            id=str(uuid.uuid4()),
            plant_id=plant.id,
            type="moved",
            title="Relocated",
            description=f"Moved from {from_loc} to {to_loc}",
            date=now,
            severity="low",
        )
        db.add(milestone)


router = APIRouter(prefix="/plants", tags=["care"])


@router.get("/{plant_id}/care", response_model=CareLogPage)
def get_care_logs(
    plant_id: str,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    offset = (page - 1) * page_size
    logs = db.query(CareLog).filter(CareLog.plant_id == plant_id)\
            .order_by(CareLog.timestamp.desc())\
            .offset(offset).limit(page_size).all()
    
    total = db.query(CareLog).filter(CareLog.plant_id == plant_id).count()
    
    return CareLogPage(
        items=[CareLogResponse(**log.__dict__) for log in logs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/{plant_id}/care", response_model=CareLogResponse, status_code=201)
def create_care_log(
    plant_id: str,
    care_log: CareLogCreate,
    db: Session = Depends(get_db),
):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    log = CareLog(
        id=str(uuid.uuid4()),
        plant_id=plant_id,
        type=care_log.type,
        timestamp=care_log.timestamp,
        notes=care_log.notes,
        care_metadata=care_log.care_metadata,
    )
    db.add(log)
    
    # Auto-create milestones
    _create_auto_milestones(db, plant, log)
    
    db.commit()
    db.refresh(log)
    return CareLogResponse(**log.__dict__)