#!/usr/bin/env python
"""
Fix SQLAlchemy 'metadata' reserved attribute error
Run this script from the PROJECT ROOT, not from /backend
"""

import os
import re

def fix_contact_model():
    """Fix the Message model in contact.py"""
    # ✅ CORRECTED PATH - from project root
    file_path = "backend/app/models/contact.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        print(f"   Current directory: {os.getcwd()}")
        print(f"   Please run this script from the PROJECT ROOT folder")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the file already has the fix
    if 'message_metadata' in content:
        print(f"✅ Already fixed: {file_path}")
        return True
    
    # Find the metadata column line
    if 'metadata = Column(JSON, default=dict)' in content:
        # Replace the column definition
        new_content = content.replace(
            'metadata = Column(JSON, default=dict)',
            'message_metadata = Column(JSON, default=dict)  # ← RENAMED from metadata'
        )
        
        # Replace in to_dict method
        new_content = new_content.replace(
            "'metadata': self.metadata,",
            "'message_metadata': self.message_metadata,"
        )
        new_content = new_content.replace(
            '"metadata": self.metadata,',
            '"message_metadata": self.message_metadata,'
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Fixed: {file_path}")
        return True
    else:
        print(f"⚠️ No 'metadata' column found in {file_path}")
        print(f"   Please check the file manually")
        return False

def fix_inbox_routes():
    """Fix metadata references in inbox.py"""
    file_path = "backend/app/routes/inbox.py"
    
    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace metadata references
    new_content = content.replace('metadata={"replied_by":', 'message_metadata={"replied_by":')
    new_content = new_content.replace('metadata={"sent_by":', 'message_metadata={"sent_by":')
    new_content = new_content.replace('"metadata": m.metadata', '"message_metadata": m.message_metadata')
    new_content = new_content.replace("'metadata': m.metadata", "'message_metadata': m.message_metadata")
    
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Fixed: {file_path}")
    else:
        print(f"⚠️ No changes needed in {file_path}")
    
    return True

if __name__ == "__main__":
    print("🔧 Fixing SQLAlchemy 'metadata' reserved attribute error...")
    print("=" * 50)
    print(f"Current directory: {os.getcwd()}")
    print("=" * 50)
    
    fix_contact_model()
    fix_inbox_routes()
    
    print("=" * 50)
    print("✅ Fix script completed!")
    print("\n🚀 Now restart your backend server:")
    print("   cd backend")
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")