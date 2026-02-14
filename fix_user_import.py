#!/usr/bin/env python
"""
Fix missing User imports in route files
Run this script from the PROJECT ROOT
"""

import os

def fix_inventory_routes():
    """Add User import to inventory.py"""
    file_path = "backend/app/routes/inventory.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if User is already imported
    if 'from app.models.user import User' in content:
        print(f"✅ User already imported in {file_path}")
        return True
    
    # Add User import after other imports
    lines = content.split('\n')
    new_lines = []
    import_added = False
    
    for line in lines:
        new_lines.append(line)
        if 'from app.models.workspace import Workspace' in line and not import_added:
            new_lines.append('from app.models.user import User')
            import_added = True
    
    if not import_added:
        # Add at the top if no suitable place found
        new_lines.insert(3, 'from app.models.user import User')
    
    new_content = '\n'.join(new_lines)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Added User import to {file_path}")
    return True

def fix_onboarding_routes():
    """Check onboarding.py for User import"""
    file_path = "backend/app/routes/onboarding.py"
    
    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'from app.models.user import User' not in content:
        new_content = content.replace(
            'from app.models.user import UserRole',
            'from app.models.user import User, UserRole'
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated User import in {file_path}")
    
    return True

if __name__ == "__main__":
    print("🔧 Fixing missing User imports...")
    print("=" * 50)
    
    fix_inventory_routes()
    fix_onboarding_routes()
    
    print("=" * 50)
    print("✅ Fix script completed!")
    print("\n🚀 Now restart your backend server:")
    print('   cd "C:\\Users\\Aarzoo\\Job Project\\careOps\\careops-platform\\backend"')
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")
    