from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.config import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=True)
    description = Column(Text)
    
    quantity = Column(Integer, default=0)
    threshold = Column(Integer, default=5)
    unit = Column(String, default="pieces")
    
    # Tracking
    low_stock_alert_sent = Column(Boolean, default=False)
    reorder_point = Column(Integer, nullable=True)
    supplier_info = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("Workspace", back_populates="inventory_items")
    usage_history = relationship("InventoryUsage", back_populates="item", cascade="all, delete-orphan")
    
    @property
    def is_low_stock(self):
        return self.quantity <= self.threshold
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "description": self.description,
            "quantity": self.quantity,
            "threshold": self.threshold,
            "unit": self.unit,
            "is_low_stock": self.is_low_stock,
            "low_stock_alert_sent": self.low_stock_alert_sent,
            "reorder_point": self.reorder_point,
            "supplier_info": self.supplier_info,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class InventoryUsage(Base):
    __tablename__ = "inventory_usage"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    inventory_id = Column(String, ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(String, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    
    quantity_used = Column(Integer, nullable=False)
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    item = relationship("InventoryItem", back_populates="usage_history")
    booking = relationship("Booking", back_populates="inventory_usage")
    
    def to_dict(self):
        return {
            "id": self.id,
            "inventory_id": self.inventory_id,
            "booking_id": self.booking_id,
            "quantity_used": self.quantity_used,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }