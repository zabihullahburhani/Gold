from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# اتصال به دیتابیس SQLite
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

# Session برای query ها
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base برای مدل‌ها
Base = declarative_base()

# Dependency برای FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
