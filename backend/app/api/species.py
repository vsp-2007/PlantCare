from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Species
from app.schemas.schemas import SpeciesCreate, SpeciesResponse, SpeciesSearchResult

router = APIRouter(tags=["species"])


@router.get("/species", response_model=list[SpeciesResponse])
def list_species(db: Session = Depends(get_db)):
    return db.query(Species).order_by(Species.common_name).all()


@router.get("/species/search", response_model=list[SpeciesSearchResult])
def search_species(q: str = Query(min_length=1), db: Session = Depends(get_db)):
    term = f"%{q}%"
    species = (
        db.query(Species)
        .filter(
            Species.common_name.ilike(term) | Species.scientific_name.ilike(term)
        )
        .order_by(Species.common_name)
        .limit(20)
        .all()
    )
    return species


@router.post("/species", response_model=SpeciesResponse, status_code=201)
def create_species(body: SpeciesCreate, db: Session = Depends(get_db)):
    existing = db.query(Species).filter(Species.id == body.id).first()
    if existing:
        raise HTTPException(409, "Species with this ID already exists")
    species = Species(**body.model_dump())
    db.add(species)
    db.commit()
    db.refresh(species)
    return species