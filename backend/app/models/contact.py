from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.config import Base

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String, nullable=False)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True, index=True)
    
    # Metadata
    source = Column(String)  # contact_form, booking, manual, import
    tags = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict)
    
    # Status
    is_active = Column(Boolean, default=True)
    unsubscribed = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_contacted = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    workspace = relationship("Workspace", back_populates="contacts")
    bookings = relationship("Booking", back_populates="contact")
    conversations = relationship("Conversation", back_populates="contact")
    form_submissions = relationship("FormSubmission", back_populates="contact")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "source": self.source,
            "tags": self.tags,
            "custom_fields": self.custom_fields,
            "is_active": self.is_active,
            "unsubscribed": self.unsubscribed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_contacted": self.last_contacted.isoformat() if self.last_contacted else None
        }

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(String, ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)
    
    subject = Column(String)
    status = Column(String, default="active")  # active, resolved, archived
    
    # Metadata
    message_count = Column(Integer, default=0)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    last_message_direction = Column(String)  # inbound, outbound
    awaiting_reply = Column(Boolean, default=False)
    assigned_to_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="conversations")
    contact = relationship("Contact", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_conversations")
    
    def to_dict(self):
        return {
            "id": self.id,
            "contact_id": self.contact_id,
            "subject": self.subject,
            "status": self.status,
            "message_count": self.message_count,
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "last_message_direction": self.last_message_direction,
            "awaiting_reply": self.awaiting_reply,
            "assigned_to_id": self.assigned_to_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    
    content = Column(Text, nullable=False)
    channel = Column(String)  # email, sms, form, api
    direction = Column(String)  # inbound, outbound
    status = Column(String, default="sent")  # sent, delivered, read, failed
    
    # Metadata - RENAMED from 'metadata' to 'message_metadata'
    automated = Column(Boolean, default=False)
    message_message_metadata = Column(JSON, default=dict)  # ? RENAMED  # ← CHANGED: 'metadata' → 'message_metadata'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "content": self.content,
            "channel": self.channel,
            "direction": self.direction,
            "status": self.status,
            "automated": self.automated,
            "message_metadata": self.message_metadata,  # ← CHANGED
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
