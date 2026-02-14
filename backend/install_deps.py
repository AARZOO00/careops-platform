#!/usr/bin/env python
"""
Install all backend dependencies
Run this script from the backend folder
"""

import subprocess
import sys

def install_dependencies():
    """Install all required packages"""
    
    packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "sqlalchemy==2.0.23",
        "pydantic==2.5.0",
        "pydantic-settings==2.1.0",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.6",
        "python-dotenv==1.0.0",
        "email-validator==2.0.0.post2",
    ]
    
    print("📦 Installing backend dependencies...")
    print("=" * 50)
    
    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    print("=" * 50)
    print("✅ All dependencies installed successfully!")

if __name__ == "__main__":
    install_dependencies()