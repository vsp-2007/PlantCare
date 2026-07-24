import unittest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal, init_db
from app.models import Species, Plant, Milestone, CareLog


class TestCareAPI(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)
        self.db = SessionLocal()

        self.species_id = f"care_species_{uuid.uuid4().hex[:6]}"
        species = Species(
            id=self.species_id,
            common_name="Care Test Species",
            scientific_name="Cariana testus",
            water_frequency_days=5,
            light_level="high",
            soil_type="loam",
            fertilizer_frequency_days=20,
            humidity_preference="medium",
            temperature_min=15.0,
            temperature_max=30.0
        )
        self.db.add(species)

        self.plant_id = f"care_plant_{uuid.uuid4().hex[:6]}"
        plant = Plant(
            id=self.plant_id,
            nickname="Care Specimen",
            species_id=self.species_id,
            location="Sunroom",
            acquired_date=datetime.utcnow()
        )
        self.db.add(plant)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_create_care_log_and_auto_milestone(self):
        # Create watering log -> triggers first_sprout milestone
        log_payload = {
            "type": "water",
            "timestamp": datetime.utcnow().isoformat(),
            "notes": "Watered 300ml distilled water",
            "care_metadata": {"volume_ml": 300}
        }
        res = self.client.post(f"/api/v1/plants/{self.plant_id}/care", json=log_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["type"], "water")

        # Verify auto-milestone was created
        milestones = self.db.query(Milestone).filter(Milestone.plant_id == self.plant_id).all()
        self.assertGreaterEqual(len(milestones), 1)
        types = [m.type for m in milestones]
        self.assertIn("first_sprout", types)

    def test_get_care_logs_paginated(self):
        # Add 3 care logs
        for t in ["water", "fertilize", "inspect"]:
            self.client.post(f"/api/v1/plants/{self.plant_id}/care", json={
                "type": t,
                "timestamp": datetime.utcnow().isoformat(),
                "notes": f"Performed {t}"
            })

        res = self.client.get(f"/api/v1/plants/{self.plant_id}/care?page=1&page_size=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)
        self.assertGreaterEqual(data["total"], 3)
