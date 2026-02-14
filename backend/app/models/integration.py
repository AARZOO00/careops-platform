from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Enum, Integer, Integer # ← ADDED Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
import uuid

from app.config import Base

class IntegrationType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    CALENDAR = "calendar"
    STORAGE = "storage"
    WEBHOOK = "webhook"

class IntegrationProvider(str, enum.Enum):
    SENDGRID = "sendgrid"
    SMTP = "smtp"
    TWILIO = "twilio"
    GOOGLE = "google"
    MICROSOFT = "microsoft"
    CUSTOM = "custom"

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    type = Column(Enum(IntegrationType), nullable=False)
    provider = Column(Enum(IntegrationProvider), nullable=False)
    name = Column(String, nullable=False)
    
    # Configuration
    config = Column(JSON, default=dict)
    credentials = Column(JSON, default=dict)  # Encrypted in production
    
    # Status
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    error_count = Column(Integer, default=0)  # ← NOW WORKS (Integer is imported)
    last_error = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="integrations")
    
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type.value if self.type else None,
            "provider": self.provider.value if self.provider else None,
            "name": self.name,
            "config": self.config,
            "is_active": self.is_active,
            "last_used": self.last_used.isoformat() if self.last_used else None,
            "error_count": self.error_count,
            "last_error": self.last_error,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
