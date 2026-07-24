import unittest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal, init_db
from app.models import Species, Plant


class TestAIVisionWeatherAPI(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)
        self.db = SessionLocal()

        self.species_id = f"ai_species_{uuid.uuid4().hex[:6]}"
        species = Species(
            id=self.species_id,
            common_name="AI Test Plant",
            scientific_name="Intelligence botanica",
            water_frequency_days=7,
            light_level="medium",
            soil_type="soil",
            fertilizer_frequency_days=30,
            humidity_preference="medium",
            temperature_min=18.0,
            temperature_max=28.0
        )
        self.db.add(species)

        self.plant_id = f"ai_plant_{uuid.uuid4().hex[:6]}"
        plant = Plant(
            id=self.plant_id,
            nickname="AI Test Monstera",
            species_id=self.species_id,
            location="Indoor desk",
            acquired_date=datetime.utcnow()
        )
        self.db.add(plant)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"status": "healthy"})

    def test_weather_endpoint(self):
        res = self.client.get("/api/v1/weather/current?lat=37.7749&lon=-122.4194")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("current", data)
        self.assertIn("forecast", data)

    def test_vision_identify_endpoint(self):
        payload = {"image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="}
        res = self.client.post("/api/v1/vision/identify", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("suggestions", data)
        self.assertGreaterEqual(len(data["suggestions"]), 1)

    def test_ai_survival_score(self):
        res = self.client.post("/api/v1/ai/survival-score", json={"plant_id": self.plant_id})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("score", data)
        self.assertIn("factors", data)

    def test_ai_stress_prediction(self):
        res = self.client.post("/api/v1/ai/stress-prediction", json={"plant_id": self.plant_id})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("risks", data)

    def test_ai_emergency_rescue(self):
        payload = {"plant_id": self.plant_id, "symptoms": "Yellow drooping lower leaves"}
        res = self.client.post("/api/v1/ai/emergency-rescue", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("steps", data)

    def test_ai_growth_forecast(self):
        res = self.client.post("/api/v1/ai/growth-forecast", json={"plant_id": self.plant_id})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("milestones", data)
