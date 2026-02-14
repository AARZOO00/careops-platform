from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FormFieldBase(BaseModel):
    field_id: str
    field_type: str
    label: str
    placeholder: Optional[str] = None
    required: bool = False
    options: List[str] = []
    validation_rules: Dict[str, Any] = {}
    order_index: int = 0

class FormFieldCreate(FormFieldBase):
    pass

class FormField(FormFieldBase):
    id: str
    form_id: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FormBase(BaseModel):
    name: str
    description: Optional[str] = None
    form_type: str
    service_id: Optional[str] = None
    require_before_booking: bool = False
    settings: Dict[str, Any] = {}

class FormCreate(FormBase):
    fields: List[FormFieldCreate]

class Form(FormBase):
    id: str
    workspace_id: str
    is_active: bool
    fields: List[FormField] = []
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FormSubmissionBase(BaseModel):
    data: Dict[str, Any]

class FormSubmissionCreate(FormSubmissionBase):
    token: str

class FormSubmission(FormSubmissionBase):
    id: str
    form_id: str
    booking_id: Optional[str] = None
    contact_id: str
    token: str
    sent_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True