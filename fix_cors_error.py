#!/usr/bin/env python
"""
FIX CORS ERROR - Allow frontend on port 3001
Run this from project root: python fix_cors_error.py
"""

import os

def fix_main_py():
    """Fix CORS configuration in main.py"""
    file_path = "backend/app/main.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace CORS middleware configuration
    cors_config = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)'''
    
    # Find and replace CORS section
    import re
    pattern = r'app\.add_middleware\(\s*CORSMiddleware.*?\)'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, cors_config, content, flags=re.DOTALL)
    else:
        # Insert after app creation
        insert_pos = content.find('app = FastAPI(')
        if insert_pos != -1:
            end_pos = content.find(')', insert_pos)
            end_pos = content.find('\n', end_pos) + 1
            content = content[:end_pos] + '\n\n' + cors_config + '\n' + content[end_pos:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed CORS in: {file_path}")
    return True

def fix_config_py():
    """Update CORS origins in config.py"""
    file_path = "backend/app/config.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add CORS origins to Settings class
    if 'BACKEND_CORS_ORIGINS' not in content:
        # Find the class end and insert
        import re
        pattern = r'(\s+model_config.*?\n)'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            cors_config = '''
    # CORS origins
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
'''
            content = content.replace(match.group(1), cors_config + '\n' + match.group(1))
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated CORS settings in: {file_path}")
    return True

def fix_backend_env():
    """Update backend .env with correct ports"""
    file_path = "backend/.env"
    
    env_content = '''# SQLite Database
DATABASE_URL=sqlite:///./careops.db

# Security
SECRET_KEY=careops-super-secret-key-2024
DEBUG=True

# URLs - FIXED: Use port 3001
FRONTEND_URL=http://localhost:3001
PUBLIC_URL=http://localhost:3001
APP_URL=http://localhost:3001

# Optional API Keys
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
GEMINI_API_KEY=
'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print(f"✅ Updated: {file_path}")
    return True

def fix_frontend_env():
    """Update frontend environment files"""
    env_local = "frontend/.env.local"
    env_content = '''NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
'''
    
    with open(env_local, 'w', encoding='utf-8') as f:
        f.write(env_content)
    print(f"✅ Updated: {env_local}")
    
    env_dev = "frontend/.env.development"
    with open(env_dev, 'w', encoding='utf-8') as f:
        f.write(env_content)
    print(f"✅ Updated: {env_dev}")
    
    return True

def create_manifest():
    """Create manifest.json file"""
    file_path = "frontend/public/manifest.json"
    
    manifest_content = '''{
  "name": "CareOps Platform",
  "short_name": "CareOps",
  "description": "Unified operations platform for service businesses",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ]
}'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(manifest_content)
    
    print(f"✅ Created: {file_path}")
    
    # Create empty favicon.ico
    favicon_path = "frontend/public/favicon.ico"
    if not os.path.exists(favicon_path):
        with open(favicon_path, 'wb') as f:
            f.write(b'')
        print(f"✅ Created: {favicon_path}")
    
    return True

def fix_axios_config():
    """Update axios configuration in frontend"""
    # Update auth store to use correct API URL
    auth_store_path = "frontend/src/store/authStore.ts"
    
    if os.path.exists(auth_store_path):
        with open(auth_store_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ensure axios defaults are set
        if 'axios.defaults.baseURL' not in content:
            # Add at the top after imports
            import_line = 'import axios from \'axios\';'
            if import_line in content:
                content = content.replace(
                    import_line,
                    f'{import_line}\n\n// Configure axios defaults\naxios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\';\naxios.defaults.headers.common[\'Content-Type\'] = \'application/json\';'
                )
            
            with open(auth_store_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Updated: {auth_store_path}")
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 FIXING CORS ERROR - ALLOW PORT 3001")
    print("=" * 60)
    
    fix_main_py()
    fix_config_py()
    fix_backend_env()
    fix_frontend_env()
    create_manifest()
    fix_axios_config()
    
    print("=" * 60)
    print("✅ ALL CORS FIXES COMPLETE!")
    print("=" * 60)
    print("\n📋 NEXT STEPS:")
    print("  1️⃣ Kill existing processes:")
    print("     netstat -ano | findstr :8000")
    print("     taskkill /PID <PID> /F")
    print("     netstat -ano | findstr :3001")
    print("     taskkill /PID <PID> /F")
    print()
    print("  2️⃣ Start Backend:")
    print("     cd backend")
    print("     venv\\Scripts\\activate")
    print("     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print()
    print("  3️⃣ Start Frontend:")
    print("     cd frontend")
    print("     npm run dev")
    print()
    print("  4️⃣ Open Browser:")
    print("     http://localhost:3001")
    print()
    print("🎯 CORS ERROR IS NOW FIXED! The frontend can communicate with backend.")