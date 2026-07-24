from sqlalchemy.orm import Session
from app.db.database import engine, SessionLocal, Base, init_db, get_db


def get_db_session() -> Session:
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()