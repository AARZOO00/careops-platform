from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, validator

from app.config import get_db
from app.dependencies import get_current_workspace, get_current_user
from app.models.workspace import Workspace, Service
from app.models.booking import Booking, BookingStatus
from app.models.contact import Contact
from app.models.user import User  
from app.services.automation import AutomationService

router = APIRouter()

# Pydantic models
class BookingUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class BookingReschedule(BaseModel):
    start_time: datetime
    
    @validator('start_time')
    def validate_start_time(cls, v):
        if v < datetime.utcnow():
            raise ValueError('Start time must be in the future')
        return v

class BookingCreate(BaseModel):
    service_id: str
    contact_id: str
    start_time: datetime
    notes: Optional[str] = None
    
    @validator('start_time')
    def validate_start_time(cls, v):
        if v < datetime.utcnow():
            raise ValueError('Start time must be in the future')
        return v

# Routes
@router.get("")
async def get_bookings(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    contact_id: Optional[str] = None,
    service_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get bookings with filters"""
    
    query = db.query(Booking).filter(
        Booking.workspace_id == workspace.id
    )
    
    if status:
        try:
            booking_status = BookingStatus(status.lower())
            query = query.filter(Booking.status == booking_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    if contact_id:
        query = query.filter(Booking.contact_id == contact_id)
    
    if service_id:
        query = query.filter(Booking.service_id == service_id)
    
    if start_date:
        try:
            start_datetime = datetime.fromisoformat(start_date)
            query = query.filter(Booking.start_time >= start_datetime)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use ISO format."
            )
    
    if end_date:
        try:
            end_datetime = datetime.fromisoformat(end_date)
            query = query.filter(Booking.start_time <= end_datetime)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use ISO format."
            )
    
    total = query.count()
    bookings = query.order_by(Booking.start_time.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "bookings": [b.to_dict() for b in bookings]
    }

@router.get("/{booking_id}")
async def get_booking(
    booking_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get single booking details"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return booking.to_dict()

@router.post("")
async def create_booking(
    data: BookingCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    
    # Verify service
    service = db.query(Service).filter(
        Service.id == data.service_id,
        Service.workspace_id == workspace.id,
        Service.is_active == True
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Verify contact
    contact = db.query(Contact).filter(
        Contact.id == data.contact_id,
        Contact.workspace_id == workspace.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Calculate end time
    end_time = data.start_time + timedelta(minutes=service.duration)
    
    # Check for conflicts
    conflicting = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.service_id == service.id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        Booking.start_time < end_time,
        Booking.end_time > data.start_time
    ).first()
    
    if conflicting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot is not available"
        )
    
    # Create booking
    booking = Booking(
        workspace_id=workspace.id,
        service_id=service.id,
        contact_id=contact.id,
        start_time=data.start_time,
        end_time=end_time,
        timezone=workspace.timezone,
        status=BookingStatus.CONFIRMED,
        notes=data.notes,
        confirmation_sent=False
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Trigger automation
    await AutomationService.handle_booking_created(workspace, booking)
    
    return {
        "status": "success",
        "booking": booking.to_dict()
    }

@router.patch("/{booking_id}")
async def update_booking(
    booking_id: str,
    data: BookingUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Update booking"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if data.status:
        try:
            booking.status = BookingStatus(data.status.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {data.status}"
            )
    
    if data.notes is not None:
        booking.notes = data.notes
    
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "booking": booking.to_dict()
    }

@router.post("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Confirm a pending booking"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = BookingStatus.CONFIRMED
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    # Send confirmation if not already sent
    if not booking.confirmation_sent:
        await AutomationService.handle_booking_created(workspace, booking)
        booking.confirmation_sent = True
        db.commit()
    
    return {
        "status": "success",
        "message": "Booking confirmed",
        "booking": booking.to_dict()
    }

@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    reason: Optional[str] = None
):
    """Cancel booking"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = datetime.utcnow()
    booking.cancellation_reason = reason
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    # TODO: Send cancellation notification
    
    return {
        "status": "success",
        "message": "Booking cancelled",
        "booking": booking.to_dict()
    }

@router.post("/{booking_id}/reschedule")
async def reschedule_booking(
    booking_id: str,
    data: BookingReschedule,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Reschedule booking"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if not booking.service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking has no associated service"
        )
    
    # Calculate new end time
    end_time = data.start_time + timedelta(minutes=booking.service.duration)
    
    # Check for conflicts
    conflicting = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.service_id == booking.service_id,
        Booking.id != booking.id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        Booking.start_time < end_time,
        Booking.end_time > data.start_time
    ).first()
    
    if conflicting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot is not available"
        )
    
    # Update booking
    booking.start_time = data.start_time
    booking.end_time = end_time
    booking.status = BookingStatus.RESCHEDULED
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    # TODO: Send reschedule notification
    
    return {
        "status": "success",
        "message": "Booking rescheduled",
        "booking": booking.to_dict()
    }

@router.post("/{booking_id}/no-show")
async def mark_no_show(
    booking_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Mark booking as no-show"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = BookingStatus.NO_SHOW
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "message": "Marked as no-show",
        "booking": booking.to_dict()
    }

@router.post("/{booking_id}/complete")
async def complete_booking(
    booking_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Mark booking as completed"""
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.workspace_id == workspace.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = BookingStatus.COMPLETED
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "message": "Marked as completed",
        "booking": booking.to_dict()
    }

@router.get("/calendar/availability")
async def check_availability(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    service_id: Optional[str] = None,
    date: Optional[str] = None
):
    """Check availability for a specific date"""
    
    query_date = datetime.fromisoformat(date) if date else datetime.utcnow()
    
    services = db.query(Service).filter(
        Service.workspace_id == workspace.id,
        Service.is_active == True
    )
    
    if service_id:
        services = services.filter(Service.id == service_id)
    
    result = []
    for service in services:
        # Get day of week (1-7, 1=Monday)
        day_of_week = query_date.isoweekday()
        
        # Find availability for this day
        availability = next(
            (a for a in service.availability if a.get("day") == day_of_week),
            None
        )
        
        if availability and availability.get("enabled", False):
            slots = availability.get("slots", [])
            
            # Filter out booked slots
            available_slots = []
            for slot_time in slots:
                slot_datetime = datetime.combine(
                    query_date.date(),
                    datetime.strptime(slot_time, "%H:%M").time()
                )
                
                # Check if slot is booked
                conflicting = db.query(Booking).filter(
                    Booking.workspace_id == workspace.id,
                    Booking.service_id == service.id,
                    Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
                    Booking.start_time == slot_datetime
                ).first()
                
                if not conflicting:
                    available_slots.append(slot_time)
            
            result.append({
                "service_id": service.id,
                "service_name": service.name,
                "date": query_date.isoformat(),
                "day_of_week": day_of_week,
                "available_slots": available_slots,
                "duration": service.duration,
                "price": service.price
            })
    
    return result