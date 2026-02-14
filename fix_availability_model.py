#!/usr/bin/env python
"""
Fix missing Availability model in workspace.py
Run this script from the PROJECT ROOT
"""

import os

def fix_workspace_model():
    """Add Availability model to workspace.py"""
    file_path = "backend/app/models/workspace.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if Availability already exists
    if 'class Availability' in content:
        print(f"✅ Availability model already exists in {file_path}")
        return True
    
    # Add relationship to Service class if not present
    if 'availabilities = relationship' not in content:
        content = content.replace(
            'forms = relationship("Form", back_populates="service")',
            'forms = relationship("Form", back_populates="service")\n    availabilities = relationship("Availability", back_populates="service", cascade="all, delete-orphan")'
        )
    
    # Add Availability class at the end of the file
    availability_class = '''

class Availability(Base):
    """Availability schedule for services"""
    __tablename__ = "availabilities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    
    # Day of week (1-7, 1=Monday)
    day_of_week = Column(Integer, nullable=False)
    
    # Time slots
    start_time = Column(String, nullable=False)  # Format: "09:00"
    end_time = Column(String, nullable=False)    # Format: "17:00"
    
    # Recurrence
    is_recurring = Column(Boolean, default=True)
    specific_date = Column(DateTime(timezone=True), nullable=True)  # For non-recurring
    
    # Status
    is_available = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="availabilities")
    
    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "is_recurring": self.is_recurring,
            "specific_date": self.specific_date.isoformat() if self.specific_date else None,
            "is_available": self.is_available,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
'''
    
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(availability_class)
    
    print(f"✅ Added Availability model to {file_path}")
    return True

def fix_init_files():
    """Update __init__.py files to include Availability"""
    # Update models/__init__.py
    models_init = "backend/app/models/__init__.py"
    if os.path.exists(models_init):
        with open(models_init, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'Availability' not in content:
            # Add to import
            content = content.replace(
                'from app.models.workspace import Workspace, Service',
                'from app.models.workspace import Workspace, Service, Availability'
            )
            # Add to __all__
            content = content.replace(
                '"Workspace", "Service"',
                '"Workspace", "Service", "Availability"'
            )
            
            with open(models_init, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Updated {models_init}")
    
    # Update app/__init__.py
    app_init = "backend/app/__init__.py"
    if os.path.exists(app_init):
        with open(app_init, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'Availability' not in content:
            content = content.replace(
                'from app.models.workspace import Workspace, Service',
                'from app.models.workspace import Workspace, Service, Availability'
            )
            
            with open(app_init, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Updated {app_init}")
    
    return True

if __name__ == "__main__":
    print("🔧 Fixing missing Availability model...")
    print("=" * 50)
    
    fix_workspace_model()
    fix_init_files()
    
    print("=" * 50)
    print("✅ Fix script completed!")
    print("\n🚀 Now restart your backend server:")
    print("   cd backend")
    print('   cd "C:\\Users\\Aarzoo\\Job Project\\careOps\\careops-platform\\backend"')
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")