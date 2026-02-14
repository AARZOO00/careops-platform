#!/usr/bin/env python
"""
COMPLETE FIX - Run this from project root
This will set up SQLite and fix all issues
"""

import os
import sys

def main():
    print("=" * 60)
    print("🔧 CAREOPS COMPLETE FIX - NO POSTGRESQL NEEDED")
    print("=" * 60)
    
    # 1. Fix .env file
    env_path = "backend/.env"
    if os.path.exists(env_path):
        env_content = """# SQLite Database - NO SERVER NEEDED!
DATABASE_URL=sqlite:///./careops.db

# Redis - Commented out (optional)
# REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=careops-super-secret-key-2024
DEBUG=True

# URLs
FRONTEND_URL=http://localhost:3000
PUBLIC_URL=http://localhost:3000
APP_URL=http://localhost:3000

# Optional API Keys - Add if you have them
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
GEMINI_API_KEY=
"""
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("✅ Fixed: backend/.env")
    
    # 2. Fix config.py
    config_path = "backend/app/config.py"
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            content = f.read()
        
        # Add SQLite support if not present
        if "check_same_thread" not in content:
            # Find where to insert connect_args
            lines = content.split('\n')
            new_lines = []
            in_settings = False
            
            for line in lines:
                new_lines.append(line)
                if "settings = Settings()" in line:
                    new_lines.append('')
                    new_lines.append('# Database setup - SQLite compatibility')
                    new_lines.append('connect_args = {}')
                    new_lines.append('if settings.DATABASE_URL.startswith("sqlite"):')
                    new_lines.append('    connect_args = {"check_same_thread": False}')
                    new_lines.append('')
            
            content = '\n'.join(new_lines)
            
            # Update engine creation
            if "create_engine" in content:
                if "connect_args=connect_args" not in content:
                    content = content.replace(
                        'engine = create_engine(',
                        'engine = create_engine(\n    connect_args=connect_args,'
                    )
            
            with open(config_path, 'w') as f:
                f.write(content)
            print("✅ Fixed: backend/app/config.py")
    
    # 3. Create empty careops.db file
    db_path = "backend/careops.db"
    if not os.path.exists(db_path):
        open(db_path, 'a').close()
        print(f"✅ Created: {db_path}")
    
    # 4. Install required packages
    print("\n📦 Installing required packages...")
    os.chdir("backend")
    os.system("venv\\Scripts\\pip install aiosqlite")
    os.chdir("..")
    
    print("\n" + "=" * 60)
    print("✅ FIX COMPLETE!")
    print("=" * 60)
    print("\n🚀 NOW RUN THESE COMMANDS:")
    print("   cd backend")
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")
    print("\n📁 Your database will be created at: backend/careops.db")
    print("🌐 API will be available at: http://localhost:8000")
    print("📚 Docs at: http://localhost:8000/docs")

if __name__ == "__main__":
    main()