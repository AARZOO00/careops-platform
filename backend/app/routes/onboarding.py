from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr, validator
import re
import secrets
import string

from app.config import get_db
from app.dependencies import get_current_workspace, get_current_admin
from app.models.workspace import Workspace, Service
from app.models.user import User, UserRole  # ← CRITICAL IMPORT
from app.models.inventory import InventoryItem
from app.models.form import Form
from app.models.integration import Integration, IntegrationType, IntegrationProvider
from app.routes.auth import get_password_hash

router = APIRouter()

# Pydantic models
class Step1Workspace(BaseModel):
    business_name: str
    address: str
    timezone: str
    contact_email: EmailStr
    contact_phone: Optional[str] = None

class Step2EmailConfig(BaseModel):
    provider: str
    api_key: str
    from_email: EmailStr

class Step2SMSConfig(BaseModel):
    provider: str
    account_sid: str
    auth_token: str
    from_number: str

class Step2Integrations(BaseModel):
    email: Optional[Step2EmailConfig] = None
    sms: Optional[Step2SMSConfig] = None

class AvailabilitySlot(BaseModel):
    day: int
    enabled: bool
    slots: List[str]

class Step3Service(BaseModel):
    name: str
    description: str
    duration: int
    price: int
    location_type: str
    availability: List[AvailabilitySlot]
    
    @validator('duration')
    def validate_duration(cls, v):
        if v < 15:
            raise ValueError('Duration must be at least 15 minutes')
        if v > 480:
            raise ValueError('Duration cannot exceed 8 hours')
        return v

class Step4Inventory(BaseModel):
    name: str
    quantity: int
    threshold: int
    unit: str
    sku: Optional[str] = None

class FormField(BaseModel):
    id: str
    type: str
    label: str
    required: bool = False
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None

class Step5Form(BaseModel):
    name: str
    description: str
    form_type: str
    fields: List[FormField]

class Step6Team(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "staff"

@router.post("/step1/workspace")
async def setup_workspace(
    data: Step1Workspace,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Step 1: Setup workspace basic info"""
    workspace.name = data.business_name
    workspace.address = data.address
    workspace.timezone = data.timezone
    workspace.contact_email = data.contact_email
    workspace.contact_phone = data.contact_phone
    workspace.onboarding_step = max(workspace.onboarding_step, 1)
    
    db.commit()
    
    return {
        "status": "success", 
        "step": 1, 
        "message": "Workspace configured successfully"
    }

@router.post("/step2/integrations")
async def setup_integrations(
    data: Step2Integrations,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Step 2: Setup communication channels"""
    
    has_channel = False
    
    # Email integration
    if data.email:
        existing = db.query(Integration).filter(
            Integration.workspace_id == workspace.id,
            Integration.type == IntegrationType.EMAIL,
            Integration.provider == IntegrationProvider(data.email.provider)
        ).first()
        
        if existing:
            existing.credentials = {
                "api_key": data.email.api_key,
                "from_email": data.email.from_email
            }
            existing.is_active = True
            existing.updated_at = datetime.utcnow()
        else:
            email_integration = Integration(
                workspace_id=workspace.id,
                type=IntegrationType.EMAIL,
                provider=IntegrationProvider(data.email.provider),
                name=f"Email - {data.email.provider}",
                credentials={
                    "api_key": data.email.api_key,
                    "from_email": data.email.from_email
                },
                is_active=True
            )
            db.add(email_integration)
        has_channel = True
    
    # SMS integration
    if data.sms:
        existing = db.query(Integration).filter(
            Integration.workspace_id == workspace.id,
            Integration.type == IntegrationType.SMS,
            Integration.provider == IntegrationProvider(data.sms.provider)
        ).first()
        
        if existing:
            existing.credentials = {
                "account_sid": data.sms.account_sid,
                "auth_token": data.sms.auth_token,
                "from_number": data.sms.from_number
            }
            existing.is_active = True
            existing.updated_at = datetime.utcnow()
        else:
            sms_integration = Integration(
                workspace_id=workspace.id,
                type=IntegrationType.SMS,
                provider=IntegrationProvider(data.sms.provider),
                name=f"SMS - {data.sms.provider}",
                credentials={
                    "account_sid": data.sms.account_sid,
                    "auth_token": data.sms.auth_token,
                    "from_number": data.sms.from_number
                },
                is_active=True
            )
            db.add(sms_integration)
        has_channel = True
    
    if not has_channel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one communication channel is required"
        )
    
    workspace.onboarding_step = max(workspace.onboarding_step, 2)
    db.commit()
    
    return {
        "status": "success", 
        "step": 2, 
        "message": "Communication channels configured successfully"
    }

@router.post("/step3/services")
async def setup_service(
    data: Step3Service,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Step 3: Create booking service"""
    
    availability_dict = [slot.model_dump() for slot in data.availability]
    
    service = Service(
        workspace_id=workspace.id,
        name=data.name,
        description=data.description,
        duration=data.duration,
        price=data.price,
        location_type=data.location_type,
        availability=availability_dict,
        is_active=True
    )
    db.add(service)
    workspace.onboarding_step = max(workspace.onboarding_step, 3)
    db.commit()
    db.refresh(service)
    
    return {
        "status": "success", 
        "step": 3, 
        "service_id": service.id,
        "service": service.to_dict(),
        "booking_link": f"/public/book/{workspace.slug}"
    }

@router.post("/step4/inventory")
async def setup_inventory(
    data: Step4Inventory,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Step 4: Add inventory items"""
    
    sku = data.sku
    if not sku:
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        sku = f"INV-{timestamp}-{workspace.id[:4].upper()}"
    
    item = InventoryItem(
        workspace_id=workspace.id,
        name=data.name,
        sku=sku,
        quantity=data.quantity,
        threshold=data.threshold,
        unit=data.unit
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return {
        "status": "success", 
        "step": 4, 
        "item_id": item.id,
        "item": item.to_dict()
    }

@router.post("/step5/forms")
async def setup_form(
    data: Step5Form,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Step 5: Create forms"""
    
    fields_dict = [field.model_dump() for field in data.fields]
    
    form = Form(
        workspace_id=workspace.id,
        name=data.name,
        description=data.description,
        form_type=data.form_type,
        fields=fields_dict,
        is_active=True
    )
    db.add(form)
    workspace.onboarding_step = max(workspace.onboarding_step, 5)
    db.commit()
    db.refresh(form)
    
    return {
        "status": "success", 
        "step": 5, 
        "form_id": form.id,
        "form": form.to_dict()
    }

@router.post("/step6/team")
async def add_team_member(
    data: Step6Team,
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Step 6: Invite team members"""
    
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    user = User(
        email=data.email,
        password_hash=get_password_hash(temp_password),
        full_name=data.full_name,
        role=UserRole.STAFF,
        workspace_id=workspace.id,
        is_active=True
    )
    db.add(user)
    workspace.onboarding_step = max(workspace.onboarding_step, 6)
    db.commit()
    db.refresh(user)
    
    return {
        "status": "success", 
        "step": 6, 
        "user_id": user.id,
        "user": user.to_dict(),
        "message": f"Invitation sent to {data.email}"
    }

@router.post("/activate")
async def activate_workspace(
    workspace: Workspace = Depends(get_current_workspace),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate workspace - final step"""
    
    integrations = db.query(Integration).filter(
        Integration.workspace_id == workspace.id,
        Integration.is_active == True
    ).all()
    
    if not integrations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No communication channels configured. At least one channel (email or SMS) is required."
        )
    
    services = db.query(Service).filter(
        Service.workspace_id == workspace.id,
        Service.is_active == True
    ).count()
    
    if services == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one service is required"
        )
    
    workspace.is_active = True
    workspace.onboarding_step = 7
    workspace.activated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "message": "Workspace activated successfully! Your platform is now live.",
        "workspace": workspace.to_dict()
    }

@router.get("/status")
async def get_onboarding_status(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get current onboarding status"""
    
    integrations_count = db.query(Integration).filter(
        Integration.workspace_id == workspace.id
    ).count()
    
    services_count = db.query(Service).filter(
        Service.workspace_id == workspace.id
    ).count()
    
    inventory_count = db.query(InventoryItem).filter(
        InventoryItem.workspace_id == workspace.id
    ).count()
    
    forms_count = db.query(Form).filter(
        Form.workspace_id == workspace.id
    ).count()
    
    staff_count = db.query(User).filter(
        User.workspace_id == workspace.id,
        User.role == UserRole.STAFF
    ).count()
    
    steps = {
        1: {
            "completed": bool(workspace.name and workspace.address and workspace.contact_email),
            "required": True
        },
        2: {
            "completed": integrations_count > 0,
            "required": True
        },
        3: {
            "completed": services_count > 0,
            "required": True
        },
        4: {
            "completed": inventory_count > 0,
            "required": False
        },
        5: {
            "completed": forms_count > 0,
            "required": False
        },
        6: {
            "completed": staff_count > 0,
            "required": False
        }
    }
    
    return {
        "current_step": workspace.onboarding_step,
        "is_active": workspace.is_active,
        "activated_at": workspace.activated_at.isoformat() if workspace.activated_at else None,
        "steps": steps,
        "workspace": workspace.to_dict()
    }