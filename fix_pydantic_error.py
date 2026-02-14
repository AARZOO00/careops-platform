#!/usr/bin/env python
"""
Fix Pydantic datetime validation error
"""

import os

def fix_auth_py():
    """Update auth.py with proper datetime handling"""
    auth_path = "backend/app/routes/auth.py"
    
    if not os.path.exists(auth_path):
        print(f"❌ File not found: {auth_path}")
        return False
    
    with open(auth_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already fixed
    if "field_serializer" in content or "json_encoders" in content:
        print("✅ auth.py already has datetime fixes")
        return True
    
    # Add import if needed
    if "from pydantic import" in content:
        content = content.replace(
            "from pydantic import BaseModel",
            "from pydantic import BaseModel, field_serializer"
        )
    
    # Find UserResponse class and add serializer
    if "class UserResponse(BaseModel):" in content:
        # Add Config with json_encoders
        class_config = '''
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    )'''
        
        content = content.replace(
            "class UserResponse(BaseModel):",
            "from pydantic import ConfigDict\nfrom datetime import datetime\n\nclass UserResponse(BaseModel):"
        )
        
        # Insert config after fields
        import re
        pattern = r'(class UserResponse\(BaseModel\):.*?)(\n\s+class Config)'
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                r'\1' + class_config + r'\2',
                content,
                flags=re.DOTALL
            )
    
    with open(auth_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed auth.py with datetime serialization")
    return True

if __name__ == "__main__":
    print("🔧 Fixing Pydantic datetime validation error...")
    fix_auth_py()
    print("\n✅ FIX APPLIED! Restart your backend server.")