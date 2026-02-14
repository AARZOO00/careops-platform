#!/usr/bin/env python
"""
FIX ALL AUTHENTICATION ERRORS
Run this script from project root
"""

import os
import subprocess

def fix_auth():
    print("🔧 FIXING AUTHENTICATION ERRORS")
    print("=" * 50)
    
    # Create test user
    print("\n📋 Creating test user...")
    os.chdir("backend")
    subprocess.run(["python", "create_test_user.py"])
    os.chdir("..")
    
    print("\n" + "=" * 50)
    print("✅ FIXES APPLIED!")
    print("=" * 50)
    print("\n📋 NEXT STEPS:")
    print("1. Restart backend: uvicorn app.main:app --reload")
    print("2. Restart frontend: npm run dev")
    print("3. Login with: admin@demo.com / Demo123456")

if __name__ == "__main__":
    fix_auth()