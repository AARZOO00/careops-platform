#!/usr/bin/env python
"""
COMPLETE FIX - Reinstall bcrypt and create admin user
Run this from backend folder
"""

import subprocess
import sys
import os

def fix_bcrypt():
    """Fix bcrypt installation"""
    print("🔧 Fixing bcrypt installation...")
    
    # Uninstall
    subprocess.run([sys.executable, "-m", "pip", "uninstall", "bcrypt", "passlib", "-y"])
    
    # Install
    subprocess.run([sys.executable, "-m", "pip", "install", "bcrypt==4.0.1"])
    subprocess.run([sys.executable, "-m", "pip", "install", "passlib[bcrypt]==1.7.4"])
    
    # Test
    try:
        import bcrypt
        print(f"✅ bcrypt version: {bcrypt.__version__}")
        return True
    except ImportError as e:
        print(f"❌ bcrypt import failed: {e}")
        return False

def create_admin_user():
    """Create admin user with proper password hashing"""
    print("\n👤 Creating admin user...")
    
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    from app.config import SessionLocal, engine, Base
    from app.models.user import User, UserRole
    from app.models.workspace import Workspace
    from passlib.context import CryptContext
    
    # Create password context directly (bypass auth.py)
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Delete existing admin if any
        existing = db.query(User).filter(User.email == "admin@demo.com").first()
        if existing:
            print("📋 Removing existing admin user...")
            db.delete(existing)
            db.commit()
        
        # Check for existing workspace or create new
        workspace = db.query(Workspace).filter(Workspace.slug == "demo-workspace").first()
        
        if not workspace:
            import uuid
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
            print("✅ Created new workspace")
        else:
            print("✅ Using existing workspace")
        
        # Hash password directly
        import uuid
        password_hash = pwd_context.hash("Demo123456")
        
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
        
        print("\n✅✅✅ ADMIN USER CREATED SUCCESSFULLY! ✅✅✅")
        print("=" * 50)
        print("📧 Email:    admin@demo.com")
        print("🔑 Password: Demo123456")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if fix_bcrypt():
        create_admin_user()
    else:
        print("❌ Failed to fix bcrypt. Please check your Python installation.")