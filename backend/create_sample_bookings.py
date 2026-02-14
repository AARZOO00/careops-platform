#!/usr/bin/env python
"""
Create sample bookings for testing
Run this AFTER creating test user
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import SessionLocal
from app.models.workspace import Workspace, Service
from app.models.contact import Contact
from app.models.booking import Booking, BookingStatus
from datetime import datetime, timedelta

def create_sample_bookings():
    """Create sample bookings for the demo workspace"""
    
    db = SessionLocal()
    
    try:
        # Get demo workspace
        workspace = db.query(Workspace).filter(Workspace.slug == "demo-workspace").first()
        if not workspace:
            print("❌ Demo workspace not found!")
            print("   Please run: python create_test_user.py first")
            return
        
        print(f"✅ Found workspace: {workspace.name}")
        
        # Get or create a service
        service = db.query(Service).filter(Service.workspace_id == workspace.id).first()
        if not service:
            print("📋 Creating sample service...")
            service = Service(
                workspace_id=workspace.id,
                name="Consultation",
                description="Initial consultation meeting",
                duration=60,
                price=9900,  # $99.00
                location_type="virtual",
                is_active=True
            )
            db.add(service)
            db.flush()
            print("✅ Created sample service")
        else:
            print("✅ Found existing service")
        
        # Create contacts
        contacts = []
        contact_data = [
            {"name": "Sarah Johnson", "email": "sarah.johnson@example.com", "phone": "+1234567890"},
            {"name": "Michael Chen", "email": "michael.chen@example.com", "phone": "+1234567891"},
            {"name": "Emily Rodriguez", "email": "emily.rodriguez@example.com", "phone": "+1234567892"}
        ]
        
        print("\n📋 Creating contacts...")
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
                print(f"  ✅ Created: {contact.name}")
            else:
                print(f"  ✅ Found: {contact.name}")
            
            contacts.append(contact)
        
        # Create bookings
        print("\n📋 Creating bookings...")
        now = datetime.now()
        
        # Booking 1: Today at 10:30 AM
        booking1 = Booking(
            workspace_id=workspace.id,
            service_id=service.id,
            contact_id=contacts[0].id,
            start_time=now.replace(hour=10, minute=30, second=0, microsecond=0),
            end_time=now.replace(hour=11, minute=30, second=0, microsecond=0),
            status=BookingStatus.CONFIRMED,
            notes="First time client, interested in marketing services",
            confirmation_sent=True
        )
        db.add(booking1)
        print(f"  ✅ Created booking for {contacts[0].name} at 10:30 AM")
        
        # Booking 2: Today at 2:00 PM
        booking2 = Booking(
            workspace_id=workspace.id,
            service_id=service.id,
            contact_id=contacts[1].id,
            start_time=now.replace(hour=14, minute=0, second=0, microsecond=0),
            end_time=now.replace(hour=15, minute=0, second=0, microsecond=0),
            status=BookingStatus.CONFIRMED,
            notes="Follow-up meeting",
            confirmation_sent=True
        )
        db.add(booking2)
        print(f"  ✅ Created booking for {contacts[1].name} at 2:00 PM")
        
        # Booking 3: Tomorrow at 9:00 AM
        tomorrow = now + timedelta(days=1)
        booking3 = Booking(
            workspace_id=workspace.id,
            service_id=service.id,
            contact_id=contacts[2].id,
            start_time=tomorrow.replace(hour=9, minute=0, second=0, microsecond=0),
            end_time=tomorrow.replace(hour=10, minute=0, second=0, microsecond=0),
            status=BookingStatus.PENDING,
            notes="Project kickoff meeting",
            confirmation_sent=False
        )
        db.add(booking3)
        print(f"  ✅ Created booking for {contacts[2].name} at 9:00 AM tomorrow")
        
        db.commit()
        
        # Count total bookings
        total_bookings = db.query(Booking).filter(Booking.workspace_id == workspace.id).count()
        
        print("\n" + "=" * 50)
        print("✅ SAMPLE BOOKINGS CREATED SUCCESSFULLY!")
        print("=" * 50)
        print(f"   Total bookings: {total_bookings}")
        print(f"   Workspace: {workspace.name}")
        print(f"   Service: {service.name}")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_bookings()