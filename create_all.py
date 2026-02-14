#!/usr/bin/env python
"""
ONE SCRIPT TO RULE THEM ALL - Run this once to set up everything
"""

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.config import SessionLocal, engine, Base
from backend.app.models.user import User, UserRole
from backend.app.models.workspace import Workspace, Service
from backend.app.models.contact import Contact
from backend.app.models.booking import Booking, BookingStatus
from backend.app.routes.auth import get_password_hash
from datetime import datetime, timedelta

def setup_database():
    """Complete database setup - users, services, contacts, bookings"""
    
    print("=" * 60)
    print("🔧 CAREOPS - COMPLETE DATABASE SETUP")
    print("=" * 60)
    
    # Create tables
    print("\n📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Step 1: Create workspace and admin user
        print("\n📋 Step 1: Setting up workspace and admin...")
        
        workspace = db.query(Workspace).filter(Workspace.slug == "demo-workspace").first()
        if not workspace:
            workspace = Workspace(
                name="Demo Workspace",
                slug="demo-workspace",
                onboarding_step=7,
                is_active=True
            )
            db.add(workspace)
            db.flush()
            print("  ✅ Created workspace: Demo Workspace")
        else:
            print("  ✅ Workspace already exists")
        
        # Create admin user
        user = db.query(User).filter(User.email == "admin@demo.com").first()
        if not user:
            user = User(
                email="admin@demo.com",
                password_hash=get_password_hash("Demo123456"),
                full_name="Demo Admin",
                role=UserRole.ADMIN,
                workspace_id=workspace.id,
                is_active=True
            )
            db.add(user)
            db.flush()
            print("  ✅ Created admin user: admin@demo.com / Demo123456")
        else:
            print("  ✅ Admin user already exists")
        
        # Step 2: Create service
        print("\n📋 Step 2: Setting up services...")
        
        service = db.query(Service).filter(
            Service.workspace_id == workspace.id,
            Service.name == "Consultation"
        ).first()
        
        if not service:
            service = Service(
                workspace_id=workspace.id,
                name="Consultation",
                description="60 minute consultation meeting",
                duration=60,
                price=9900,
                location_type="virtual",
                is_active=True
            )
            db.add(service)
            db.flush()
            print("  ✅ Created service: Consultation (60 min, $99)")
        else:
            print("  ✅ Service already exists")
        
        # Step 3: Create contacts
        print("\n📋 Step 3: Creating sample contacts...")
        
        contacts = []
        contact_data = [
            {"name": "Sarah Johnson", "email": "sarah.johnson@example.com", "phone": "+1234567890"},
            {"name": "Michael Chen", "email": "michael.chen@example.com", "phone": "+1234567891"},
            {"name": "Emily Rodriguez", "email": "emily.rodriguez@example.com", "phone": "+1234567892"}
        ]
        
        for data in contact_data:
            contact = db.query(Contact).filter(
                Contact.workspace_id == workspace.id,
                Contact.email == data["email"]
            ).first()
            
            if not contact:
                contact = Contact(
                    workspace_id=workspace.id,
                    name=data["name"],
                    email=data["email"],
                    phone=data["phone"],
                    source="sample"
                )
                db.add(contact)
                db.flush()
                print(f"  ✅ Created contact: {data['name']}")
            else:
                print(f"  ✅ Contact already exists: {data['name']}")
            
            contacts.append(contact)
        
        # Step 4: Create bookings
        print("\n📋 Step 4: Creating sample bookings...")
        
        now = datetime.now()
        
        # Check if bookings already exist
        existing_bookings = db.query(Booking).filter(
            Booking.workspace_id == workspace.id
        ).count()
        
        if existing_bookings > 0:
            print(f"  ⚠️  {existing_bookings} bookings already exist. Skipping...")
        else:
            # Booking 1: Today 10:30 AM
            booking1 = Booking(
                workspace_id=workspace.id,
                service_id=service.id,
                contact_id=contacts[0].id,
                start_time=now.replace(hour=10, minute=30, second=0, microsecond=0),
                end_time=now.replace(hour=11, minute=30, second=0, microsecond=0),
                status=BookingStatus.CONFIRMED,
                notes="First time client - marketing consultation",
                confirmation_sent=True
            )
            db.add(booking1)
            print("  ✅ Created booking: Sarah Johnson at 10:30 AM (Confirmed)")
            
            # Booking 2: Today 2:00 PM
            booking2 = Booking(
                workspace_id=workspace.id,
                service_id=service.id,
                contact_id=contacts[1].id,
                start_time=now.replace(hour=14, minute=0, second=0, microsecond=0),
                end_time=now.replace(hour=15, minute=0, second=0, microsecond=0),
                status=BookingStatus.CONFIRMED,
                notes="Follow-up meeting - project update",
                confirmation_sent=True
            )
            db.add(booking2)
            print("  ✅ Created booking: Michael Chen at 2:00 PM (Confirmed)")
            
            # Booking 3: Tomorrow 9:00 AM
            tomorrow = now + timedelta(days=1)
            booking3 = Booking(
                workspace_id=workspace.id,
                service_id=service.id,
                contact_id=contacts[2].id,
                start_time=tomorrow.replace(hour=9, minute=0, second=0, microsecond=0),
                end_time=tomorrow.replace(hour=10, minute=0, second=0, microsecond=0),
                status=BookingStatus.PENDING,
                notes="Project kickoff - new website",
                confirmation_sent=False
            )
            db.add(booking3)
            print("  ✅ Created booking: Emily Rodriguez at 9:00 AM tomorrow (Pending)")
        
        db.commit()
        
        # Final summary
        print("\n" + "=" * 60)
        print("✅ COMPLETE SETUP SUCCESSFUL!")
        print("=" * 60)
        
        # Count everything
        user_count = db.query(User).filter(User.workspace_id == workspace.id).count()
        contact_count = db.query(Contact).filter(Contact.workspace_id == workspace.id).count()
        booking_count = db.query(Booking).filter(Booking.workspace_id == workspace.id).count()
        
        print(f"\n📊 DATABASE SUMMARY:")
        print(f"   • Workspace: {workspace.name}")
        print(f"   • Users: {user_count}")
        print(f"   • Services: 1")
        print(f"   • Contacts: {contact_count}")
        print(f"   • Bookings: {booking_count}")
        
        print(f"\n🔐 LOGIN CREDENTIALS:")
        print(f"   • Email:    admin@demo.com")
        print(f"   • Password: Demo123456")
        
        print(f"\n🌐 ACCESS YOUR APP:")
        print(f"   • Frontend: http://localhost:3001")
        print(f"   • Backend:  http://localhost:8000")
        print(f"   • API Docs: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_database()