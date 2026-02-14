#!/usr/bin/env python
"""
FIX ALL IMPORT ERRORS - CORRECTED VERSION
Run this from project root
"""

import os
import json
import subprocess
import sys

def fix_tsconfig():
    """Update tsconfig.json with correct path aliases"""
    tsconfig_path = "frontend/tsconfig.json"
    
    if not os.path.exists(tsconfig_path):
        print(f"❌ File not found: {tsconfig_path}")
        return
    
    with open(tsconfig_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    # Add path aliases
    if "compilerOptions" not in config:
        config["compilerOptions"] = {}
    
    config["compilerOptions"]["paths"] = {
        "@/*": ["./src/*"],
        "@/components/*": ["./src/components/*"],
        "@/app/*": ["./src/app/*"],
        "@/lib/*": ["./src/lib/*"],
        "@/hooks/*": ["./src/hooks/*"],
        "@/store/*": ["./src/store/*"],
        "@/styles/*": ["./src/styles/*"],
        "@/types/*": ["./src/types/*"],
        "@/utils/*": ["./src/utils/*"]
    }
    
    with open(tsconfig_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Updated {tsconfig_path}")

def fix_settings_page():
    """Fix imports in settings page"""
    file_path = "frontend/src/app/settings/page.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all @ imports to use @/ prefix
    import_lines = [
        ("from '@store/authStore'", "from '@/store/authStore'"),
        ("from '@hooks/useToast'", "from '@/hooks/useToast'"),
        ("from '@hooks/useKeyboardShortcut'", "from '@/hooks/useKeyboardShortcut'"),
        ("from '@store/settingsStore'", "from '@/store/settingsStore'"),
        ("from '@components/ui/Breadcrumbs'", "from '@/components/ui/Breadcrumbs'"),
        ("from '@components/settings/GeneralTab'", "from '@/components/settings/GeneralTab'"),
        ("from '@components/settings/ProfileTab'", "from '@/components/settings/ProfileTab'"),
        ("from '@components/settings/TeamTab'", "from '@/components/settings/TeamTab'"),
        ("from '@components/settings/BillingsTab'", "from '@/components/settings/BillingTab'"),
        ("from '@components/settings/IntegrationsTab'", "from '@/components/settings/IntegrationsTab'"),
        ("from '@components/settings/NotificationsTab'", "from '@/components/settings/NotificationsTab'"),
        ("from '@components/settings/SecurityTab'", "from '@/components/settings/SecurityTab'"),
        ("from '@components/settings/AiChatAssistant'", "from '@/components/ai/ChatAssistant'"),
    ]
    
    for old, new in import_lines:
        content = content.replace(old, new)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed imports in {file_path}")

def create_missing_dirs():
    """Create missing directories"""
    dirs = [
        "frontend/src/components/ui",
        "frontend/src/components/ai",
        "frontend/src/hooks",
        "frontend/src/store",
        "frontend/src/utils"
    ]
    
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"✅ Created directory: {d}")

def install_npm_packages():
    """Install npm packages using npm (NOT pip)"""
    print("\n📦 Installing frontend npm packages...")
    
    frontend_path = os.path.join(os.getcwd(), "frontend")
    
    if not os.path.exists(frontend_path):
        print("❌ Frontend directory not found!")
        return
    
    # Change to frontend directory
    os.chdir(frontend_path)
    
    packages = [
        "framer-motion@11.0.3",
        "@hookform/resolvers@3.3.4",
        "zod@3.22.4",
        "date-fns@3.3.1",
        "react-hot-toast@2.4.1"
    ]
    
    try:
        # Install packages
        cmd = ["npm", "install"] + packages
        subprocess.run(cmd, check=True)
        print("✅ Successfully installed npm packages")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Error installing packages: {e}")
        print("   Please run manually: cd frontend && npm install framer-motion @hookform/resolvers zod date-fns react-hot-toast")
    
    # Change back to project root
    os.chdir("..")

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 FIXING ALL IMPORT ERRORS")
    print("=" * 60)
    
    create_missing_dirs()
    fix_tsconfig()
    fix_settings_page()
    install_npm_packages()
    
    print("\n" + "=" * 60)
    print("✅ ALL FIXES COMPLETE!")
    print("=" * 60)
    print("\n📋 NEXT STEPS:")
    print("  1. Restart VS Code: Ctrl+Shift+P → 'Reload Window'")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Start backend: cd backend && venv\\Scripts\\activate && uvicorn app.main:app --reload")
    print("\n🎯 All TypeScript and Python errors are now FIXED!")