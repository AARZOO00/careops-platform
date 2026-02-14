from ast import Import
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
import uuid

from app.config import get_db
from app.dependencies import get_current_workspace, get_current_admin
from app.models.workspace import Service, Workspace
from app.models.form import Form, FormSubmission
from app.models.booking import Booking
from app.models.contact import Contact
from app.models.user import User  
from app.services.email import send_email

router = APIRouter()

# Pydantic models
class FormField(BaseModel):
    id: str
    type: str
    label: str
    required: bool = False
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None

class FormCreate(BaseModel):
    name: str
    description: str
    form_type: str
    service_id: Optional[str] = None
    fields: List[FormField]
    require_before_booking: bool = False
    settings: Optional[dict] = None

class FormUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[FormField]] = None
    is_active: Optional[bool] = None
    require_before_booking: Optional[bool] = None
    settings: Optional[dict] = None

class FormSubmissionSend(BaseModel):
    booking_id: str
    contact_id: str

# Routes
@router.get("")
async def get_forms(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    service_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all forms"""
    
    query = db.query(Form).filter(
        Form.workspace_id == workspace.id
    )
    
    if service_id:
        query = query.filter(Form.service_id == service_id)
    
    if is_active is not None:
        query = query.filter(Form.is_active == is_active)
    
    total = query.count()
    forms = query.order_by(Form.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "forms": [form.to_dict() for form in forms]
    }

@router.post("")
async def create_form(
    data: FormCreate,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new form"""
    
    # Verify service if provided
    if data.service_id:
        service = db.query(Service).filter(
            Service.id == data.service_id,
            Service.workspace_id == workspace.id
        ).first()
        
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
    
    # Convert fields to dict
    fields_dict = [field.dict() for field in data.fields]
    
    form = Form(
        workspace_id=workspace.id,
        service_id=data.service_id,
        name=data.name,
        description=data.description,
        form_type=data.form_type,
        fields=fields_dict,
        require_before_booking=data.require_before_booking,
        settings=data.settings or Form.settings.default.arg,
        is_active=True
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    
    return {
        "status": "success",
        "form": form.to_dict()
    }

@router.get("/{form_id}")
async def get_form(
    form_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get single form"""
    
    form = db.query(Form).filter(
        Form.id == form_id,
        Form.workspace_id == workspace.id
    ).first()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    return form.to_dict()

@router.patch("/{form_id}")
async def update_form(
    form_id: str,
    data: FormUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update form"""
    
    form = db.query(Form).filter(
        Form.id == form_id,
        Form.workspace_id == workspace.id
    ).first()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Update fields
    update_data = data.dict(exclude_unset=True)
    
    if 'fields' in update_data:
        update_data['fields'] = [field.dict() for field in data.fields]
    
    for field, value in update_data.items():
        setattr(form, field, value)
    
    form.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(form)
    
    return {
        "status": "success",
        "form": form.to_dict()
    }

@router.delete("/{form_id}")
async def delete_form(
    form_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete form"""
    
    form = db.query(Form).filter(
        Form.id == form_id,
        Form.workspace_id == workspace.id
    ).first()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    db.delete(form)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Form '{form.name}' deleted successfully"
    }

@router.post("/{form_id}/send")
async def send_form(
    form_id: str,
    data: FormSubmissionSend,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Send form to contact for a booking"""
    
    form = db.query(Form).filter(
        Form.id == form_id,
        Form.workspace_id == workspace.id,
        Form.is_active == True
    ).first()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found or inactive"
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
    
    contact = db.query(Contact).filter(
        Contact.id == data.contact_id,
        Contact.workspace_id == workspace.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    if not contact.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact has no email address"
        )
    
    # Generate unique token
    token = str(uuid.uuid4())
    
    # Create submission record
    submission = FormSubmission(
        form_id=form.id,
        booking_id=booking.id,
        contact_id=contact.id,
        token=token,
        sent_at=datetime.utcnow()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Send email with form link
    form_link = f"{workspace.settings.get('public_url', 'http://localhost:3000')}/public/form/{token}"
    
    email_body = f"""
    Hello {contact.name},
    
    Please complete the following form for your upcoming appointment:
    
    Form: {form.name}
    {form.description if form.description else ''}
    
    Link: {form_link}
    
    This form needs to be completed before your appointment.
    
    Thank you,
    {workspace.name}
    """
    
    await send_email(
        to=contact.email,
        subject=f"Please complete: {form.name}",
        body=email_body,
        workspace=workspace
    )
    
    return {
        "status": "success",
        "submission_id": submission.id,
        "token": token,
        "form_link": form_link
    }

@router.get("/submissions")
async def get_form_submissions(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    form_id: Optional[str] = None,
    booking_id: Optional[str] = None,
    contact_id: Optional[str] = None,
    completed: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get form submissions"""
    
    query = db.query(FormSubmission).join(Form).filter(
        Form.workspace_id == workspace.id
    )
    
    if form_id:
        query = query.filter(FormSubmission.form_id == form_id)
    
    if booking_id:
        query = query.filter(FormSubmission.booking_id == booking_id)
    
    if contact_id:
        query = query.filter(FormSubmission.contact_id == contact_id)
    
    if completed is not None:
        if completed:
            query = query.filter(FormSubmission.completed_at != None)
        else:
            query = query.filter(FormSubmission.completed_at == None)
    
    total = query.count()
    submissions = query.order_by(
        FormSubmission.sent_at.desc()
    ).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "submissions": [s.to_dict() for s in submissions]
    }

@router.get("/submissions/{submission_id}")
async def get_form_submission(
    submission_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get single form submission"""
    
    submission = db.query(FormSubmission).join(Form).filter(
        FormSubmission.id == submission_id,
        Form.workspace_id == workspace.id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form submission not found"
        )
    
    return submission.to_dict()