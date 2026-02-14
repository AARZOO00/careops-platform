from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.config import Base

class Form(Base):
    __tablename__ = "forms"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=True)
    
    name = Column(String, nullable=False)
    description = Column(Text)
    form_type = Column(String, default="custom")
    
    # Store fields as JSON - SIMPLE AND WORKS!
    fields = Column(JSON, default=[])
    settings = Column(JSON, default={
        "submit_button_text": "Submit",
        "confirmation_message": "Thank you for your submission!"
    })
    
    is_active = Column(Boolean, default=True)
    require_before_booking = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="forms")
    service = relationship("Service", back_populates="forms")
    submissions = relationship("FormSubmission", back_populates="form", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "form_type": self.form_type,
            "fields": self.fields,
            "settings": self.settings,
            "is_active": self.is_active,
            "require_before_booking": self.require_before_booking,
            "service_id": self.service_id,
            "workspace_id": self.workspace_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class FormSubmission(Base):
    __tablename__ = "form_submissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(String, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=True)
    contact_id = Column(String, ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)
    
    token = Column(String, unique=True, index=True, nullable=False)
    data = Column(JSON, default=dict)
    
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    form = relationship("Form", back_populates="submissions")
    booking = relationship("Booking", back_populates="form_submissions")
    contact = relationship("Contact", back_populates="form_submissions")
    
    def to_dict(self):
        return {
            "id": self.id,
            "form_id": self.form_id,
            "booking_id": self.booking_id,
            "contact_id": self.contact_id,
            "token": self.token,
            "data": self.data,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }