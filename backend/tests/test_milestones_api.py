import unittest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal, init_db
from app.models import Species, Plant


class TestMilestonesAPI(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)
        self.db = SessionLocal()

        self.species_id = f"milestone_species_{uuid.uuid4().hex[:6]}"
        species = Species(
            id=self.species_id,
            common_name="Milestone Plant",
            scientific_name="Milestonus botanica",
            water_frequency_days=7,
            light_level="high",
            soil_type="soil",
            fertilizer_frequency_days=30,
            humidity_preference="high",
            temperature_min=18.0,
            temperature_max=28.0
        )
        self.db.add(species)

        self.plant_id = f"milestone_plant_{uuid.uuid4().hex[:6]}"
        plant = Plant(
            id=self.plant_id,
            nickname="Milestone Plant",
            species_id=self.species_id,
            location="Porch",
            acquired_date=datetime.utcnow()
        )
        self.db.add(plant)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_create_and_list_milestones(self):
        m_id = f"ms_{uuid.uuid4().hex[:6]}"
        payload = {
            "id": m_id,
            "plant_id": self.plant_id,
            "type": "first_bloom",
            "title": "First Flower Bloom",
            "description": "A bright yellow bloom appeared today!",
            "date": datetime.utcnow().isoformat(),
            "severity": "low"
        }
        res = self.client.post(f"/api/v1/plants/{self.plant_id}/milestones", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["id"], m_id)

        # List milestones
        list_res = self.client.get(f"/api/v1/plants/{self.plant_id}/milestones")
        self.assertEqual(list_res.status_code, 200)
        items = list_res.json()
        self.assertGreaterEqual(len(items), 1)
