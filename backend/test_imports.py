#!/usr/bin/env python
"""Test if all dependencies are installed correctly"""

def test_imports():
    print("🔍 Testing CareOps Backend Dependencies...")
    print("=" * 50)
    
    packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "pydantic_settings",
        "jose",
        "passlib",
        "alembic",
        "redis",
        "celery",
        "sendgrid",
        "twilio",
        "google.generativeai",
        "dotenv",
        "email_validator",
        "phonenumbers",
        "httpx",
        "jinja2",
        "dateutil",
        "bcrypt",
        "greenlet",
        "typing_extensions",
        "jwt",
        "cryptography"
    ]
    
    success = True
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            success = False
    
    print("=" * 50)
    if success:
        print("✅ All dependencies installed successfully!")
    else:
        print("❌ Some dependencies are missing. Run the installation script again.")
    
    return success

if __name__ == "__main__":
    test_imports()