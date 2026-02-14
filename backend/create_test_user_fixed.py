#!/usr/bin/env python
"""
Create test user - RUN THIS FROM BACKEND FOLDER
"""

import sys
import os
import uuid

# Add the parent directory to path (only needed if running from backend)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace
from app.routes.auth import get_password_hash

def create_user():
    print("🔧 Creating test user...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Delete existing
        existing = db.query(User).filter(User.email == "admin@demo.com").first()
        if existing:
            print("📋 Removing old user...")
            db.delete(existing)
            db.commit()
        
        # Create workspace
        print("📋 Creating workspace...")
        workspace = Workspace(
            id=str(uuid.uuid4()),
            name="Demo Workspace",
            slug="demo-workspace",
            is_active=True
        )
        db.add(workspace)
        db.flush()
        
        # Hash password
        print("🔐 Hashing password...")
        password_hash = get_password_hash("Demo123456")
        
        # Create user
        print("👤 Creating user...")
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
        
        print("\n✅✅✅ USER CREATED! ✅✅✅")
        print("=" * 40)
        print("📧 Email:    admin@demo.com")
        print("🔑 Password: Demo123456")
        print("=" * 40)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_user()