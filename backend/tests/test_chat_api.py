import unittest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal, init_db
from app.models import Species, Plant


class TestChatAPI(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)
        self.db = SessionLocal()

        self.species_id = f"chat_species_{uuid.uuid4().hex[:6]}"
        species = Species(
            id=self.species_id,
            common_name="Chat Test Plant",
            scientific_name="Chatus botanica",
            water_frequency_days=7,
            light_level="medium",
            soil_type="soil",
            fertilizer_frequency_days=30,
            humidity_preference="medium",
            temperature_min=18.0,
            temperature_max=28.0
        )
        self.db.add(species)

        self.plant_id = f"chat_plant_{uuid.uuid4().hex[:6]}"
        plant = Plant(
            id=self.plant_id,
            nickname="Chat Monty",
            species_id=self.species_id,
            location="Indoor desk",
            acquired_date=datetime.utcnow()
        )
        self.db.add(plant)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_chat_message_creation_and_listing(self):
        # Create user chat query
        msg_payload = {"message": "How often should I water my plant?"}
        res = self.client.post(f"/api/v1/plants/{self.plant_id}/chat", json=msg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["role"], "assistant")
        self.assertTrue(len(data["content"]) > 0)

        # List chat messages
        list_res = self.client.get(f"/api/v1/plants/{self.plant_id}/chat")
        self.assertEqual(list_res.status_code, 200)
        messages = list_res.json()
        self.assertGreaterEqual(len(messages), 2)  # User message + AI response
