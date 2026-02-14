#!/usr/bin/env python
"""
Test authentication
"""

import requests
import json

base_url = "http://localhost:8000"

def test_login():
    print("Testing login...")
    
    # Test with demo credentials
    data = {
        "username": "admin@demo.com",
        "password": "Demo123456"
    }
    
    response = requests.post(
        f"{base_url}/api/auth/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Login successful!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Login failed: {response.text}")

if __name__ == "__main__":
    test_login()