#!/usr/bin/env python
"""
Create admin user - Run this from backend folder
"""

import sys
import os
import uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace
from app.routes.auth import get_password_hash

def create_admin():
    print("🔧 Creating admin user...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "admin@demo.com").first()
        if existing_user:
            print("✅ User already exists")
            print(f"📧 Email: admin@demo.com")
            print(f"🔑 Password: Demo123456")
            return
        
        # Check if workspace exists, if so use it or create new with unique slug
        workspace = db.query(Workspace).filter(Workspace.slug == "demo-workspace").first()
        
        if not workspace:
            # Create new workspace with unique slug
            import time
            unique_slug = f"demo-workspace-{int(time.time())}"
            workspace = Workspace(
                id=str(uuid.uuid4()),
                name="Demo Workspace",
                slug=unique_slug,
                timezone="America/New_York",
                onboarding_step=7,
                is_active=True
            )
            db.add(workspace)
            db.flush()
            print(f"📋 Created new workspace: {unique_slug}")
        else:
            print(f"📋 Using existing workspace: {workspace.slug}")
        
        # Hash password
        print("🔐 Hashing password...")
        password_hash = get_password_hash("Demo123456")
        
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
        
        print("\n✅✅✅ ADMIN USER CREATED! ✅✅✅")
        print("=" * 40)
        print("📧 Email:    admin@demo.com")
        print("🔑 Password: Demo123456")
        print("=" * 40)
        
        # Verify
        verify = db.query(User).filter(User.email == "admin@demo.com").first()
        if verify:
            print(f"\n✅ Verified: User exists with ID: {verify.id}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()