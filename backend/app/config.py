import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "CareOps Unified Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database - SQLite
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./careops.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careops-super-secret-key-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ]
    
    # URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3001")
    PUBLIC_URL: str = os.getenv("PUBLIC_URL", "http://localhost:3001")
    APP_URL: str = os.getenv("APP_URL", "http://localhost:3001")
    
    # Email (Optional)
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Database setup - SQLite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()