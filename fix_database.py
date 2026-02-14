#!/usr/bin/env python
"""
Fix database connection - Switch to SQLite
Run this script from the PROJECT ROOT
"""

import os
import shutil

def fix_env_file():
    """Change .env to use SQLite"""
    env_path = "backend/.env"
    
    if not os.path.exists(env_path):
        print(f"❌ File not found: {env_path}")
        return False
    
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace PostgreSQL with SQLite
    new_content = content.replace(
        'DATABASE_URL=postgresql://careops:careops123@localhost:5432/careops',
        'DATABASE_URL=sqlite:///./careops.db'
    )
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Updated {env_path} to use SQLite")
    return True

def fix_config_py():
    """Update config.py to support SQLite"""
    config_path = "backend/app/config.py"
    
    if not os.path.exists(config_path):
        print(f"❌ File not found: {config_path}")
        return False
    
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already fixed
    if 'connect_args = {}' in content and 'check_same_thread' in content:
        print(f"✅ config.py already has SQLite support")
        return True
    
    # Add SQLite support
    if 'engine = create_engine(' in content:
        # Find the engine creation line and add connect_args
        lines = content.split('\n')
        new_lines = []
        in_engine = False
        
        for line in lines:
            new_lines.append(line)
            if 'engine = create_engine(' in line:
                in_engine = True
            elif in_engine and 'pool_pre_ping=' in line:
                # Add connect_args before this line
                new_lines.insert(len(new_lines)-1, '    connect_args=connect_args,')
                in_engine = False
        
        content = '\n'.join(new_lines)
        
        # Add connect_args definition before engine
        if 'connect_args = {}' not in content:
            connect_args_block = '''
# Database setup - with SQLite compatibility
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}  # Required for SQLite

'''
            # Find where to insert
            if 'settings = Settings()' in content:
                content = content.replace(
                    'settings = Settings()',
                    'settings = Settings()' + connect_args_block
                )
    
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {config_path} with SQLite support")
    return True

def install_aiosqlite():
    """Install aiosqlite for async support"""
    import subprocess
    import sys
    
    print("📦 Installing aiosqlite...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "aiosqlite"])
    print("✅ aiosqlite installed")
    return True

if __name__ == "__main__":
    print("🔧 Fixing database connection - Switching to SQLite...")
    print("=" * 60)
    
    fix_env_file()
    fix_config_py()
    install_aiosqlite()
    
    print("=" * 60)
    print("✅ FIX COMPLETE!")
    print("\n🚀 Now restart your backend:")
    print('   cd "C:\\Users\\Aarzoo\\Job Project\\careOps\\careops-platform\\backend"')
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")
    print("\n📁 SQLite database will be created at: backend/careops.db")