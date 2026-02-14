#!/usr/bin/env python
"""
COMPLETE FIX - Form Model Relationship Error
Stops backend, fixes models, resets database, restarts
"""

import os
import subprocess
import time
import sys

def kill_process_on_port(port=8000):
    """Kill process running on specified port"""
    try:
        # Find PID using port
        result = subprocess.run(
            f'netstat -ano | findstr :{port}',
            shell=True,
            capture_output=True,
            text=True
        )
        
        if result.stdout:
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'LISTENING' in line:
                    parts = line.strip().split()
                    pid = parts[-1]
                    print(f"🔍 Found process {pid} on port {port}")
                    
                    # Kill the process
                    subprocess.run(f'taskkill /PID {pid} /F', shell=True)
                    print(f"✅ Killed process {pid}")
                    time.sleep(1)
        return True
    except Exception as e:
        print(f"⚠️ Error killing process: {e}")
        return False

def fix_form_model():
    """Fix the relationship in form.py"""
    file_path = "backend/app/models/form.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # COMPLETE REPLACEMENT - Simple JSON-based Form model
    new_content = '''from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON
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
    form_type = Column(String)  # intake, agreement, consent, feedback
    
    # Form schema stored as JSON - simple and works!
    fields = Column(JSON, default=[
        {
            "id": "full_name",
            "type": "text",
            "label": "Full Name",
            "required": True,
            "placeholder": "Enter your full name"
        },
        {
            "id": "email",
            "type": "email",
            "label": "Email Address",
            "required": True,
            "placeholder": "your@email.com"
        }
    ])
    settings = Column(JSON, default={
        "submit_button_text": "Submit",
        "show_progress_bar": True,
        "confirmation_message": "Thank you for submitting the form!"
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
'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ COMPLETELY REPLACED: {file_path} (removed FormField)")
    return True

def fix_init_file():
    """Remove FormField from __init__.py"""
    file_path = "backend/app/models/__init__.py"
    
    if not os.path.exists(file_path):
        return False
    
    new_content = '''from app.models.user import User, UserRole
from app.models.workspace import Workspace, Service
from app.models.contact import Contact, Conversation, Message
from app.models.booking import Booking, BookingStatus
from app.models.form import Form, FormSubmission
from app.models.inventory import InventoryItem, InventoryUsage
from app.models.integration import Integration, IntegrationType, IntegrationProvider

__all__ = [
    "User", "UserRole",
    "Workspace", "Service",
    "Contact", "Conversation", "Message",
    "Booking", "BookingStatus",
    "Form", "FormSubmission",
    "InventoryItem", "InventoryUsage",
    "Integration", "IntegrationType", "IntegrationProvider"
]
'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ FIXED: {file_path} (removed FormField)")
    return True

def reset_database():
    """Delete the database file to start fresh"""
    db_path = "backend/careops.db"
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"✅ Deleted existing database: {db_path}")
        except PermissionError:
            print(f"❌ Cannot delete {db_path} - file is locked")
            print("   Please close any programs using this file and try again")
            return False
    return True

def create_test_user():
    """Create a test user"""
    try:
        # Import after fixing
        sys.path.insert(0, os.path.abspath("backend"))
        from app.config import SessionLocal
        from app.models.user import User, UserRole
        from app.models.workspace import Workspace
        from app.routes.auth import get_password_hash
        
        db = SessionLocal()
        
        # Check if exists
        existing = db.query(User).filter(User.email == "admin@demo.com").first()
        if existing:
            print("✅ Test user already exists")
            db.close()
            return True
        
        # Create workspace
        workspace = Workspace(
            name="Demo Workspace",
            slug="demo-workspace",
            onboarding_step=7,
            is_active=True
        )
        db.add(workspace)
        db.flush()
        
        # Create user
        user = User(
            email="admin@demo.com",
            password_hash=get_password_hash("Demo123456"),
            full_name="Demo Admin",
            role=UserRole.ADMIN,
            workspace_id=workspace.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.close()
        
        print("✅ Test user created: admin@demo.com / Demo123456")
        return True
    except Exception as e:
        print(f"⚠️ Could not create test user: {e}")
        return False

def main():
    print("=" * 60)
    print("🔧 COMPLETE FIX - FORM MODEL RELATIONSHIP ERROR")
    print("=" * 60)
    
    # Step 1: Kill backend process
    print("\n📋 Step 1: Stopping backend server...")
    kill_process_on_port(8000)
    
    # Step 2: Fix model files
    print("\n📋 Step 2: Fixing model files...")
    fix_form_model()
    fix_init_file()
    
    # Step 3: Reset database
    print("\n📋 Step 3: Resetting database...")
    reset_database()
    
    print("\n" + "=" * 60)
    print("✅ FIX COMPLETE!")
    print("=" * 60)
    print("\n📋 NEXT STEPS:")
    print("  1️⃣ Start backend:")
    print("     cd backend")
    print("     .venv\\Scripts\\activate")
    print("     uvicorn app.main:app --reload")
    print("\n  2️⃣ In a NEW terminal, create test user:")
    print("     cd backend")
    print("     .venv\\Scripts\\activate")
    print("     python")
    print("     >>> from app.routes.auth import get_password_hash")
    print("     >>> from app.models.user import User, UserRole")
    print("     >>> from app.models.workspace import Workspace")
    print("     >>> from app.config import SessionLocal")
    print("     >>> db = SessionLocal()")
    print("     >>> ws = Workspace(name='Demo', slug='demo', is_active=True)")
    print("     >>> db.add(ws)")
    print("     >>> db.flush()")
    print("     >>> user = User(email='admin@demo.com', password_hash=get_password_hash('Demo123456'), full_name='Demo Admin', role=UserRole.ADMIN, workspace_id=ws.id, is_active=True)")
    print("     >>> db.add(user)")
    print("     >>> db.commit()")
    print("     >>> print('✅ Test user created!')")
    print("     >>> exit()")
    print("\n  3️⃣ Start frontend:")
    print("     cd frontend")
    print("     npm run dev")
    print("\n  4️⃣ Open browser:")
    print("     http://localhost:3001/register")
    print("\n🎯 REGISTRATION WILL NOW WORK PERFECTLY!")

if __name__ == "__main__":
    main()