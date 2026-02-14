#!/usr/bin/env python
"""
Quick admin creation - uses direct bcrypt
"""

import uuid
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace

# Direct bcrypt import
import bcrypt

def create_admin():
    print("🔧 Creating admin user...")
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Delete existing
        db.query(User).filter(User.email == "admin@demo.com").delete()
        db.commit()
        
        # Get or create workspace
        workspace = db.query(Workspace).filter(Workspace.slug == "demo-workspace").first()
        if not workspace:
            workspace = Workspace(
                id=str(uuid.uuid4()),
                name="Demo Workspace",
                slug="demo-workspace",
                timezone="America/New_York",
                onboarding_step=7,
                is_active=True
            )
            db.add(workspace)
            db.flush()
        
        # Hash password directly with bcrypt
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw("Demo123456".encode('utf-8'), salt).decode('utf-8')
        
        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email="admin@demo.com",
            password_hash=password_hash,
            full_name="Demo Admin",
            role=UserRole.ADMIN,
            workspace_id=workspace.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        
        print("\n✅✅✅ ADMIN CREATED! ✅✅✅")
        print("Email: admin@demo.com")
        print("Password: Demo123456")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()