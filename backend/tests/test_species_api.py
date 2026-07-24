import unittest
import uuid
from fastapi.testclient import TestClient
from app.main import app


class TestSpeciesAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_list_and_search_species(self):
        # List species
        res = self.client.get("/api/v1/species")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

        # Search species
        search_res = self.client.get("/api/v1/species/search?q=monstera")
        self.assertEqual(search_res.status_code, 200)
        self.assertIsInstance(search_res.json(), list)

    def test_create_species(self):
        species_id = f"custom_species_{uuid.uuid4().hex[:6]}"
        payload = {
            "id": species_id,
            "common_name": "UnitTest Fern",
            "scientific_name": "Filicophyta unitus",
            "water_frequency_days": 4,
            "light_level": "medium",
            "soil_type": "rich peat",
            "fertilizer_frequency_days": 14,
            "humidity_preference": "high",
            "temperature_min": 16.0,
            "temperature_max": 26.0,
            "notes": "Unit test created species"
        }
        res = self.client.post("/api/v1/species", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["id"], species_id)
        self.assertEqual(data["common_name"], "UnitTest Fern")

        # Conflict check
        conflict_res = self.client.post("/api/v1/species", json=payload)
        self.assertEqual(conflict_res.status_code, 409)
