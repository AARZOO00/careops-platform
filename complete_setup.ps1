# CAREOPS - COMPLETE SETUP SCRIPT
# Run this as Administrator

Write-Host "🔧 CAREOPS - COMPLETE SETUP" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Step 1: Kill any existing processes
Write-Host "`n📋 Stopping existing servers..." -ForegroundColor Cyan
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" } | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force
Write-Host "  ✅ Servers stopped" -ForegroundColor Green

# Step 2: Navigate to backend
Set-Location "C:\Users\Aarzoo\Job Project\careOps\careops-platform\backend"

# Step 3: Create test user script
Write-Host "`n📋 Creating test user script..." -ForegroundColor Cyan
@"
#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace
from app.routes.auth import get_password_hash

def create_test_user():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "admin@demo.com").first():
            print("✅ Test user already exists")
            return
        workspace = Workspace(name="Demo Workspace", slug="demo-workspace", is_active=True)
        db.add(workspace)
        db.flush()
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
        print("✅ Test user created: admin@demo.com / Demo123456")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
"@ | Out-File -FilePath "create_test_user.py" -Encoding utf8
Write-Host "  ✅ create_test_user.py created" -ForegroundColor Green

# Step 4: Create sample bookings script
Write-Host "`n📋 Creating sample bookings script..." -ForegroundColor Cyan
@"
#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import SessionLocal
from app.models.workspace import Workspace, Service
from app.models.contact import Contact
from app.models.booking import Booking, BookingStatus
from datetime import datetime, timedelta

def create_sample_bookings():
    db = SessionLocal()
    try:
        workspace = db.query(Workspace).filter(Workspace.slug == "demo-workspace").first()
        if not workspace:
            print("❌ Demo workspace not found. Run create_test_user.py first")
            return
        
        service = db.query(Service).filter(Service.workspace_id == workspace.id).first()
        if not service:
            service = Service(
                workspace_id=workspace.id,
                name="Consultation",
                duration=60,
                price=9900,
                location_type="virtual",
                is_active=True
            )
            db.add(service)
            db.flush()
        
        contacts = []
        for name, email in [
            ("Sarah Johnson", "sarah@example.com"),
            ("Michael Chen", "michael@example.com"),
            ("Emily Rodriguez", "emily@example.com")
        ]:
            contact = db.query(Contact).filter(Contact.email == email).first()
            if not contact:
                contact = Contact(workspace_id=workspace.id, name=name, email=email, source="sample")
                db.add(contact)
                db.flush()
            contacts.append(contact)
        
        now = datetime.now()
        bookings = [
            (contacts[0], now.replace(hour=10, minute=30), BookingStatus.CONFIRMED),
            (contacts[1], now.replace(hour=14, minute=0), BookingStatus.CONFIRMED),
            (contacts[2], now + timedelta(days=1), BookingStatus.PENDING),
        ]
        
        for contact, start_time, status in bookings:
            end_time = start_time + timedelta(minutes=service.duration)
            booking = Booking(
                workspace_id=workspace.id,
                service_id=service.id,
                contact_id=contact.id,
                start_time=start_time,
                end_time=end_time,
                status=status,
                confirmation_sent=True
            )
            db.add(booking)
        
        db.commit()
        print("✅ Sample bookings created!")
        print(f"   Total bookings: {db.query(Booking).filter(Booking.workspace_id == workspace.id).count()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_bookings()
"@ | Out-File -FilePath "create_sample_bookings.py" -Encoding utf8
Write-Host "  ✅ create_sample_bookings.py created" -ForegroundColor Green

# Step 5: Activate venv and run scripts
Write-Host "`n📋 Running setup scripts..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1
python create_test_user.py
python create_sample_bookings.py

# Step 6: Start backend in new window
Write-Host "`n📋 Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Aarzoo\Job Project\careOps\careops-platform\backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"

# Step 7: Start frontend in new window
Write-Host "`n📋 Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Aarzoo\Job Project\careOps\careops-platform\frontend'; npm run dev"

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`n🌐 Open your browser:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📧 Demo Login:" -ForegroundColor Cyan
Write-Host "   Email:    admin@demo.com" -ForegroundColor White
Write-Host "   Password: Demo123456" -ForegroundColor White
Write-Host ""
Write-Host "📊 Dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Your CareOps Platform is now ready with sample data!" -ForegroundColor Green