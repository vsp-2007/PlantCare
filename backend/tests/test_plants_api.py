import unittest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal, init_db
from app.models import Species, Plant


class TestPlantsAPI(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)
        self.db = SessionLocal()
        
        # Ensure a test species exists
        self.species_id = f"test_species_{uuid.uuid4().hex[:6]}"
        species = Species(
            id=self.species_id,
            common_name="Test Plant Species",
            scientific_name="Botanicus testus",
            water_frequency_days=7,
            light_level="medium",
            soil_type="well-draining",
            fertilizer_frequency_days=30,
            humidity_preference="high",
            temperature_min=18.0,
            temperature_max=28.0,
            notes="Test species for unit testing",
        )
        self.db.add(species)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_create_and_get_plant(self):
        plant_id = f"test_plant_{uuid.uuid4().hex[:6]}"
        payload = {
            "id": plant_id,
            "nickname": "Unit Test Monstera",
            "species_id": self.species_id,
            "location": "Living Room Window",
            "acquired_date": datetime.utcnow().isoformat(),
            "latitude": 37.7749,
            "longitude": -122.4194,
            "photo_url": "https://example.com/plant.jpg",
        }
        res = self.client.post("/api/v1/plants", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["id"], plant_id)
        self.assertEqual(data["nickname"], "Unit Test Monstera")

        # Get plant
        get_res = self.client.get(f"/api/v1/plants/{plant_id}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["nickname"], "Unit Test Monstera")

    def test_list_plants(self):
        res = self.client.get("/api/v1/plants")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_update_plant(self):
        plant_id = f"test_plant_{uuid.uuid4().hex[:6]}"
        self.client.post("/api/v1/plants", json={
            "id": plant_id,
            "nickname": "Original Name",
            "species_id": self.species_id,
            "location": "Desk",
            "acquired_date": datetime.utcnow().isoformat()
        })
        
        update_res = self.client.put(f"/api/v1/plants/{plant_id}", json={
            "nickname": "Updated Name",
            "location": "Balcony"
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["nickname"], "Updated Name")
        self.assertEqual(update_res.json()["location"], "Balcony")

    def test_delete_plant(self):
        plant_id = f"test_plant_{uuid.uuid4().hex[:6]}"
        self.client.post("/api/v1/plants", json={
            "id": plant_id,
            "nickname": "Delete Me",
            "species_id": self.species_id,
            "location": "Storage",
            "acquired_date": datetime.utcnow().isoformat()
        })
        
        del_res = self.client.delete(f"/api/v1/plants/{plant_id}")
        self.assertEqual(del_res.status_code, 204)
        
        get_res = self.client.get(f"/api/v1/plants/{plant_id}")
        self.assertEqual(get_res.status_code, 404)

    def test_plant_passport(self):
        plant_id = f"test_plant_{uuid.uuid4().hex[:6]}"
        self.client.post("/api/v1/plants", json={
            "id": plant_id,
            "nickname": "Passport Specimen",
            "species_id": self.species_id,
            "location": "Greenhouse",
            "acquired_date": datetime.utcnow().isoformat()
        })
        
        passport_res = self.client.get(f"/api/v1/plants/{plant_id}/passport")
        self.assertEqual(passport_res.status_code, 200)
        data = passport_res.json()
        self.assertIn("plant", data)
        self.assertIn("species", data)
        self.assertIn("care_logs", data)
        self.assertIn("milestones", data)
