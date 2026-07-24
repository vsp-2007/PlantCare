import json
import os
from app.database import SessionLocal, init_db
from app.models import Species, Plant, CareLog, Milestone
from datetime import datetime, timedelta
import uuid

# Initialize database
init_db()
db = SessionLocal()

try:
    # Load species data
    with open("data/species.json", "r") as f:
        species_data = json.load(f)
    
    for s in species_data:
        existing = db.query(Species).filter(Species.id == s["id"]).first()
        if not existing:
            species = Species(
                id=s["id"],
                common_name=s["common_name"],
                scientific_name=s["scientific_name"],
                water_frequency_days=s["water_frequency_days"],
                light_level=s["light_level"],
                soil_type=s["soil_type"],
                fertilizer_frequency_days=s["fertilizer_frequency_days"],
                humidity_preference=s["humidity_preference"],
                temperature_min=s["temperature_min"],
                temperature_max=s["temperature_max"],
                notes=s.get("notes"),
            )
            db.add(species)
    
    db.commit()
    print(f"Seeded {len(species_data)} species")
    
    # Create demo plants
    demo_plants = [
        {
            "nickname": "Big Monstera",
            "species_id": "monstera",
            "location": "Living room - east window",
            "acquired_date": datetime.utcnow() - timedelta(days=60),
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
        {
            "nickname": "Office Snake Plant",
            "species_id": "snake",
            "location": "Office desk - north side",
            "acquired_date": datetime.utcnow() - timedelta(days=120),
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
        {
            "nickname": "Bedroom Pothos",
            "species_id": "pothos",
            "location": "Bedroom - hanging basket",
            "acquired_date": datetime.utcnow() - timedelta(days=30),
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
    ]
    
    for p_data in demo_plants:
        existing = db.query(Plant).filter(Plant.nickname == p_data["nickname"]).first()
        if not existing:
            plant = Plant(
                id=str(uuid.uuid4()),
                **p_data
            )
            db.add(plant)
    
    db.commit()
    print(f"Seeded {len(demo_plants)} demo plants")
    
    # Add some care logs for demo plants
    plants = db.query(Plant).all()
    for plant in plants:
        # Add a watering log
        water_log = CareLog(
            id=str(uuid.uuid4()),
            plant_id=plant.id,
            type="water",
            timestamp=datetime.utcnow() - timedelta(days=2),
            notes="Regular watering",
            care_metadata={"volume_ml": 200, "water_source": "filtered"},
        )
        db.add(water_log)
        
        # Add milestone for first watering
        milestone = Milestone(
            id=str(uuid.uuid4()),
            plant_id=plant.id,
            type="first_sprout",
            title="First Watering",
            description=f"First watering recorded for {plant.nickname}",
            date=water_log.timestamp,
            severity="low",
        )
        db.add(milestone)
    
    db.commit()
    print("Added demo care logs and milestones")
    
finally:
    db.close()

print("Seeding complete!")