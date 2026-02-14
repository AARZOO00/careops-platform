#!/usr/bin/env python
"""
Fix missing Integer import in model files
Run this script from the PROJECT ROOT
"""

import os

def fix_integration_model():
    """Add Integer import to integration.py"""
    file_path = "backend/app/models/integration.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if Integer is already imported
    if 'Integer' in content.split('from sqlalchemy import')[1].split('\n')[0]:
        print(f"✅ Integer already imported in {file_path}")
        return True
    
    # Add Integer to the import line
    new_content = content.replace(
        'from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Enum',
        'from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Enum, Integer'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Fixed Integer import in {file_path}")
    return True

def fix_form_model():
    """Add Integer import to form.py if needed"""
    file_path = "backend/app/models/form.py"
    
    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path} (skipping)")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'Integer' not in content.split('from sqlalchemy import')[1].split('\n')[0]:
        new_content = content.replace(
            'from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON',
            'from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer'
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Fixed Integer import in {file_path}")
    
    return True

if __name__ == "__main__":
    print("🔧 Fixing missing SQLAlchemy Integer imports...")
    print("=" * 50)
    
    fix_integration_model()
    fix_form_model()
    
    print("=" * 50)
    print("✅ Fix script completed!")
    print("\n🚀 Now restart your backend server:")
    print("   cd backend")
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")