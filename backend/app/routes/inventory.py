from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.config import get_db
from app.dependencies import get_current_workspace, get_current_admin
from app.models.workspace import Workspace
from app.models.inventory import InventoryItem, InventoryUsage
from app.models.booking import Booking
from app.models.user import User  # ← CRITICAL IMPORT
from app.services.automation import AutomationService

router = APIRouter()

# Pydantic models
class InventoryItemCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    quantity: int
    threshold: int
    unit: str
    reorder_point: Optional[int] = None
    supplier_info: Optional[str] = None

    class Config:
        from_attributes = True

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    threshold: Optional[int] = None
    unit: Optional[str] = None
    reorder_point: Optional[int] = None
    supplier_info: Optional[str] = None

    class Config:
        from_attributes = True

class InventoryUsageCreate(BaseModel):
    booking_id: str
    quantity_used: int
    notes: Optional[str] = None

class InventoryAdjustment(BaseModel):
    adjustment: int
    reason: str

@router.get("")
async def get_inventory_items(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    low_stock_only: bool = False,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all inventory items"""
    
    query = db.query(InventoryItem).filter(
        InventoryItem.workspace_id == workspace.id
    )
    
    if low_stock_only:
        query = query.filter(InventoryItem.quantity <= InventoryItem.threshold)
    
    if search:
        query = query.filter(
            (InventoryItem.name.ilike(f"%{search}%")) |
            (InventoryItem.sku.ilike(f"%{search}%"))
        )
    
    total = query.count()
    items = query.order_by(InventoryItem.name).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "items": [item.to_dict() for item in items]
    }

@router.post("")
async def create_inventory_item(
    data: InventoryItemCreate,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create inventory item"""
    
    # Generate SKU if not provided
    sku = data.sku
    if not sku:
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        sku = f"INV-{timestamp}-{workspace.id[:4].upper()}"
    
    # Check if SKU already exists
    existing = db.query(InventoryItem).filter(
        InventoryItem.workspace_id == workspace.id,
        InventoryItem.sku == sku
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SKU '{sku}' already exists"
        )
    
    item = InventoryItem(
        workspace_id=workspace.id,
        name=data.name,
        sku=sku,
        description=data.description,
        quantity=data.quantity,
        threshold=data.threshold,
        unit=data.unit,
        reorder_point=data.reorder_point,
        supplier_info=data.supplier_info
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return {
        "status": "success",
        "item": item.to_dict()
    }

@router.get("/{item_id}")
async def get_inventory_item(
    item_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get single inventory item"""
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.workspace_id == workspace.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Get usage history
    usage = db.query(InventoryUsage).filter(
        InventoryUsage.inventory_id == item.id
    ).order_by(InventoryUsage.created_at.desc()).limit(50).all()
    
    result = item.to_dict()
    result["usage_history"] = [u.to_dict() for u in usage]
    
    return result

@router.patch("/{item_id}")
async def update_inventory_item(
    item_id: str,
    data: InventoryItemUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update inventory item"""
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.workspace_id == workspace.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    # Reset alert flag if quantity increased above threshold
    if data.quantity is not None and item.quantity > item.threshold:
        item.low_stock_alert_sent = False
    
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    
    return {
        "status": "success",
        "item": item.to_dict()
    }

@router.post("/{item_id}/adjust")
async def adjust_inventory(
    item_id: str,
    data: InventoryAdjustment,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Adjust inventory quantity"""
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.workspace_id == workspace.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    old_quantity = item.quantity
    item.quantity += data.adjustment
    item.updated_at = datetime.utcnow()
    
    # Reset alert flag if quantity increased above threshold
    if item.quantity > item.threshold:
        item.low_stock_alert_sent = False
    
    db.commit()
    
    return {
        "status": "success",
        "item_id": item.id,
        "old_quantity": old_quantity,
        "new_quantity": item.quantity,
        "adjustment": data.adjustment,
        "is_low_stock": item.is_low_stock
    }

@router.post("/{item_id}/usage")
async def record_usage(
    item_id: str,
    data: InventoryUsageCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Record inventory usage for a booking"""
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.workspace_id == workspace.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    booking = db.query(Booking).filter(
        Booking.id == data.booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if item.quantity < data.quantity_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient inventory. Available: {item.quantity} {item.unit}"
        )
    
    # Create usage record
    usage = InventoryUsage(
        inventory_id=item.id,
        booking_id=booking.id,
        quantity_used=data.quantity_used,
        notes=data.notes
    )
    db.add(usage)
    
    # Reduce quantity
    item.quantity -= data.quantity_used
    item.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(usage)
    
    return {
        "status": "success",
        "usage": usage.to_dict(),
        "remaining_quantity": item.quantity,
        "is_low_stock": item.is_low_stock
    }

@router.delete("/{item_id}")
async def delete_inventory_item(
    item_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete inventory item"""
    
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.workspace_id == workspace.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    db.delete(item)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Inventory item '{item.name}' deleted successfully"
    }

@router.get("/alerts/low-stock")
async def get_low_stock_alerts(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get all low stock alerts"""
    
    items = db.query(InventoryItem).filter(
        InventoryItem.workspace_id == workspace.id,
        InventoryItem.quantity <= InventoryItem.threshold
    ).all()
    
    return {
        "count": len(items),
        "items": [item.to_dict() for item in items]
    }