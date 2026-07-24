import unittest
from sqlalchemy import inspect
from app.db.database import engine, SessionLocal, init_db
from app.models import Species, Plant, CareLog, ChatMessage, Milestone


class TestDatabaseInit(unittest.TestCase):
    def setUp(self):
        init_db()
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_tables_created(self):
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        expected_tables = ["species", "plants", "care_logs", "chat_messages", "milestones", "kindwise_usage"]
        for table in expected_tables:
            self.assertIn(table, tables)

    def test_session_query(self):
        species_count = self.db.query(Species).count()
        self.assertGreaterEqual(species_count, 0)
