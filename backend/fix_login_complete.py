#!/usr/bin/env python
"""
Complete fix for login issues
Run this from backend folder
"""

import sys
import os
import uuid
import time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace
from app.routes.auth import get_password_hash

def fix_all():
    print("=" * 50)
    print("🔧 COMPLETE LOGIN FIX")
    print("=" * 50)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Step 1: Check existing admin
        print("\n📋 Step 1: Checking for existing admin...")
        admin = db.query(User).filter(User.email == "admin@demo.com").first()
        if admin:
            print(f"✅ Admin exists: {admin.email}")
            print(f"   Workspace ID: {admin.workspace_id}")
        else:
            print("❌ Admin not found")
        
        # Step 2: Create admin if not exists
        if not admin:
            print("\n📋 Step 2: Creating admin user...")
            
            # Check for existing workspace or create new
            workspace = db.query(Workspace).filter(Workspace.slug.like("demo-workspace%")).first()
            
            if not workspace:
                # Create new workspace with timestamp to ensure uniqueness
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
                print(f"✅ Created workspace: {unique_slug}")
            else:
                print(f"✅ Using existing workspace: {workspace.slug}")
            
            # Create user
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
            print("✅ Admin user created!")
        
        # Step 3: Verify
        print("\n📋 Step 3: Verification")
        admin = db.query(User).filter(User.email == "admin@demo.com").first()
        if admin:
            print(f"✅ Admin verified: {admin.email}")
            print(f"   ID: {admin.id}")
            print(f"   Workspace: {admin.workspace_id}")
        
        # Step 4: List all users
        print("\n📋 All users in database:")
        users = db.query(User).all()
        for user in users:
            print(f"  - {user.email}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("\n" + "=" * 50)
    print("✅✅✅ FIX COMPLETE! ✅✅✅")
    print("=" * 50)
    print("\nLogin with:")
    print("  Email: admin@demo.com")
    print("  Password: Demo123456")

if __name__ == "__main__":
    fix_all()