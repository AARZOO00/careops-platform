from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Integer, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import re

from app.config import Base

class Workspace(Base):
    __tablename__ = "workspaces"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    address = Column(Text)
    timezone = Column(String, default="America/New_York")
    contact_email = Column(String)
    contact_phone = Column(String)
    logo_url = Column(String, nullable=True)
    
    # Onboarding
    onboarding_step = Column(Integer, default=1)
    is_active = Column(Boolean, default=False)
    activated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Settings
    settings = Column(JSON, default={
        "booking_buffer": 15,
        "reminder_hours": 24,
        "default_form_reminder_days": 2
    })
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="workspace", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="workspace", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="workspace", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="workspace", cascade="all, delete-orphan")
    forms = relationship("Form", back_populates="workspace", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="workspace", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="workspace", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="workspace", cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.slug and self.name:
            self.slug = self.generate_slug(self.name)
    
    @staticmethod
    def generate_slug(name):
        """Generate URL-friendly slug from name"""
        slug = name.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s-]+', '-', slug)
        return slug.strip('-')
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "address": self.address,
            "timezone": self.timezone,
            "contact_email": self.contact_email,
            "contact_phone": self.contact_phone,
            "logo_url": self.logo_url,
            "onboarding_step": self.onboarding_step,
            "is_active": self.is_active,
            "activated_at": self.activated_at.isoformat() if self.activated_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "booking_url": f"/public/book/{self.slug}" if self.is_active else None,
            "contact_url": f"/public/contact/{self.slug}" if self.is_active else None
        }

class Service(Base):
    __tablename__ = "services"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    duration = Column(Integer, nullable=False)  # minutes
    price = Column(Integer, default=0)  # cents
    location_type = Column(String, default="physical")  # physical, virtual, hybrid
    location_details = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    
    # Availability rules
    availability = Column(JSON, default=[
        {"day": 1, "enabled": True, "slots": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]},
        {"day": 2, "enabled": True, "slots": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]},
        {"day": 3, "enabled": True, "slots": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]},
        {"day": 4, "enabled": True, "slots": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]},
        {"day": 5, "enabled": True, "slots": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]},
        {"day": 6, "enabled": False, "slots": []},
        {"day": 7, "enabled": False, "slots": []}
    ])
    buffer_before = Column(Integer, default=0)  # minutes
    buffer_after = Column(Integer, default=0)  # minutes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="services")
    bookings = relationship("Booking", back_populates="service")
    forms = relationship("Form", back_populates="service")
    availabilities = relationship("Availability", back_populates="service", cascade="all, delete-orphan")  # ADD THIS LINE
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "duration": self.duration,
            "price": self.price,
            "location_type": self.location_type,
            "location_details": self.location_details,
            "is_active": self.is_active,
            "availability": self.availability,
            "buffer_before": self.buffer_before,
            "buffer_after": self.buffer_after,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# ============ ADD THIS ENTIRE CLASS ============
class Availability(Base):
    """Availability schedule for services"""
    __tablename__ = "availabilities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    
    # Day of week (1-7, 1=Monday)
    day_of_week = Column(Integer, nullable=False)
    
    # Time slots
    start_time = Column(String, nullable=False)  # Format: "09:00"
    end_time = Column(String, nullable=False)    # Format: "17:00"
    
    # Recurrence
    is_recurring = Column(Boolean, default=True)
    specific_date = Column(DateTime(timezone=True), nullable=True)  # For non-recurring
    
    # Status
    is_available = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="availabilities")
    
    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "is_recurring": self.is_recurring,
            "specific_date": self.specific_date.isoformat() if self.specific_date else None,
            "is_available": self.is_available,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }