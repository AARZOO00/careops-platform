from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator
import uuid

from app.config import get_db, settings
from app.models.workspace import Workspace, Service
from app.models.contact import Contact, Conversation, Message
from app.models.booking import Booking, BookingStatus
from app.models.form import Form, FormSubmission
from app.services.automation import AutomationService

router = APIRouter()

# Pydantic models
class ContactFormData(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: Optional[str] = None

class BookingRequest(BaseModel):
    service_id: str
    start_time: datetime
    name: str
    email: EmailStr
    phone: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('start_time')
    def validate_start_time(cls, v):
        if v < datetime.utcnow():
            raise ValueError('Start time must be in the future')
        return v

class FormSubmissionData(BaseModel):
    token: str
    data: dict

@router.get("/workspace/{slug}")
async def get_workspace_public(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get public workspace info"""
    
    workspace = db.query(Workspace).filter(
        Workspace.slug == slug,
        Workspace.is_active == True
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    return {
        "id": workspace.id,
        "name": workspace.name,
        "slug": workspace.slug,
        "contact_email": workspace.contact_email,
        "contact_phone": workspace.contact_phone,
        "logo_url": workspace.logo_url,
        "timezone": workspace.timezone
    }

@router.post("/contact/{slug}")
async def submit_contact_form(
    slug: str,
    data: ContactFormData,
    db: Session = Depends(get_db)
):
    """Public contact form submission"""
    
    workspace = db.query(Workspace).filter(
        Workspace.slug == slug,
        Workspace.is_active == True
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Validate contact info
    if not data.email and not data.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either email or phone is required"
        )
    
    # Create contact
    contact = Contact(
        workspace_id=workspace.id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        source="contact_form"
    )
    db.add(contact)
    db.flush()
    
    # Create conversation
    conversation = Conversation(
        workspace_id=workspace.id,
        contact_id=contact.id,
        subject=f"Inquiry from {data.name}",
        status="active",
        message_count=1 if data.message else 0,
        awaiting_reply=True,
        last_message_direction="inbound"
    )
    db.add(conversation)
    db.flush()
    
    # Add message if provided
    if data.message:
        message = Message(
            conversation_id=conversation.id,
            content=data.message,
            channel="form",
            direction="inbound",
            automated=False,
            status="received"
        )
        db.add(message)
        conversation.last_message_at = datetime.utcnow()
    
    db.commit()
    
    # Trigger automation
    await AutomationService.handle_new_contact(workspace, contact)
    
    return {
        "status": "success",
        "message": "Thank you for reaching out! We'll get back to you soon.",
        "contact_id": contact.id,
        "conversation_id": conversation.id
    }

@router.get("/book/{slug}")
async def get_booking_page(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get public booking page data"""
    
    workspace = db.query(Workspace).filter(
        Workspace.slug == slug,
        Workspace.is_active == True
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    services = db.query(Service).filter(
        Service.workspace_id == workspace.id,
        Service.is_active == True
    ).all()
    
    return {
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
            "timezone": workspace.timezone,
            "contact_email": workspace.contact_email,
            "contact_phone": workspace.contact_phone
        },
        "services": [service.to_dict() for service in services]
    }

@router.post("/book/{slug}")
async def create_booking_public(
    slug: str,
    data: BookingRequest,
    db: Session = Depends(get_db)
):
    """Public booking submission"""
    
    workspace = db.query(Workspace).filter(
        Workspace.slug == slug,
        Workspace.is_active == True
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
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
            detail="This time slot is not available. Please select another time."
        )
    
    # Find or create contact
    contact = None
    if data.email:
        contact = db.query(Contact).filter(
            Contact.workspace_id == workspace.id,
            Contact.email == data.email
        ).first()
    
    if not contact:
        contact = Contact(
            workspace_id=workspace.id,
            name=data.name,
            email=data.email,
            phone=data.phone,
            source="booking"
        )
        db.add(contact)
        db.flush()
    
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
    
    # Update confirmation sent flag
    booking.confirmation_sent = True
    db.commit()
    
    return {
        "status": "success",
        "message": "Booking confirmed! Check your email for details.",
        "booking": {
            "id": booking.id,
            "service": service.name,
            "start_time": booking.start_time.isoformat(),
            "end_time": booking.end_time.isoformat(),
            "status": booking.status.value
        }
    }

@router.get("/form/{token}")
async def get_form_public(
    token: str,
    db: Session = Depends(get_db)
):
    """Get public form by token"""
    
    submission = db.query(FormSubmission).filter(
        FormSubmission.token == token,
        FormSubmission.completed_at == None
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found or already completed"
        )
    
    form = db.query(Form).filter(Form.id == submission.form_id).first()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    booking = db.query(Booking).filter(Booking.id == submission.booking_id).first()
    contact = db.query(Contact).filter(Contact.id == submission.contact_id).first()
    
    return {
        "token": submission.token,
        "form": form.to_dict(),
        "booking": booking.to_dict() if booking else None,
        "contact": contact.to_dict() if contact else None
    }

@router.post("/form/{token}")
async def submit_form_public(
    token: str,
    data: FormSubmissionData,
    db: Session = Depends(get_db)
):
    """Submit public form"""
    
    submission = db.query(FormSubmission).filter(
        FormSubmission.token == token,
        FormSubmission.completed_at == None
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found or already completed"
        )
    
    # Validate token matches
    if submission.token != data.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    
    submission.data = data.data
    submission.completed_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "message": "Form submitted successfully",
        "submission_id": submission.id
    }

@router.get("/availability/{service_id}")
async def get_service_availability(
    service_id: str,
    db: Session = Depends(get_db),
    date: Optional[str] = None
):
    """Get available time slots for a service"""
    
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.is_active == True
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Parse date or use today
    query_date = datetime.fromisoformat(date) if date else datetime.utcnow()
    day_of_week = query_date.isoweekday()
    
    # Get availability for this day
    availability = next(
        (a for a in service.availability if a.get("day") == day_of_week),
        None
    )
    
    if not availability or not availability.get("enabled", False):
        return {
            "service_id": service.id,
            "service_name": service.name,
            "date": query_date.isoformat(),
            "available": False,
            "slots": []
        }
    
    slots = availability.get("slots", [])
    available_slots = []
    
    for slot_time in slots:
        # Parse slot time
        hour, minute = map(int, slot_time.split(':'))
        slot_datetime = query_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # Check if slot is in the past
        if slot_datetime < datetime.utcnow():
            continue
        
        # Check if slot is booked
        end_time = slot_datetime + timedelta(minutes=service.duration)
        
        conflicting = db.query(Booking).filter(
            Booking.workspace_id == service.workspace_id,
            Booking.service_id == service.id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
            Booking.start_time < end_time,
            Booking.end_time > slot_datetime
        ).first()
        
        if not conflicting:
            available_slots.append(slot_time)
    
    return {
        "service_id": service.id,
        "service_name": service.name,
        "date": query_date.isoformat(),
        "day_of_week": day_of_week,
        "duration": service.duration,
        "available": len(available_slots) > 0,
        "slots": available_slots
    }