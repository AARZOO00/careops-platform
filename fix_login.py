#!/usr/bin/env python
"""
Fix login issues - Create test user
"""

import os
import sys
import uuid
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.config import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace
from app.routes.auth import get_password_hash

def fix_login():
    print("🔧 FIXING LOGIN ISSUES")
    print("=" * 50)
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Delete existing user if any
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
        
        # Create user
        print("👤 Creating user...")
        user = User(
            id=str(uuid.uuid4()),
            email="admin@demo.com",
            password_hash=get_password_hash("Demo123456"),
            full_name="Demo Admin",
            role=UserRole.ADMIN,
            workspace_id=workspace.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        
        print("\n✅✅✅ LOGIN FIXED! ✅✅✅")
        print("=" * 50)
        print("📧 Email:    admin@demo.com")
        print("🔑 Password: Demo123456")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_login()