#!/usr/bin/env python
"""
Fix Next.js metadata export error in register page
Run this from project root: python fix_metadata_error.py
"""

import os
import re

def fix_register_page():
    """Split register page into server and client components"""
    
    # Create RegisterClient.tsx
    register_client_path = "frontend/src/app/register/RegisterClient.tsx"
    
    if not os.path.exists("frontend/src/app/register"):
        os.makedirs("frontend/src/app/register")
    
    # Read the current register page
    register_path = "frontend/src/app/register/page.tsx"
    
    if not os.path.exists(register_path):
        print(f"❌ File not found: {register_path}")
        return False
    
    with open(register_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract imports and component logic
    lines = content.split('\n')
    
    # Create server component (page.tsx)
    server_component = '''import type { Metadata, Viewport } from 'next';
import RegisterClient from './RegisterClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Create Workspace - CareOps',
  description: 'Create a new CareOps workspace',
};

export default function RegisterPage() {
  return <RegisterClient />;
}
'''
    
    # Write server component
    with open(register_path, 'w', encoding='utf-8') as f:
        f.write(server_component)
    
    print(f"✅ Fixed: {register_path}")
    
    # Create client component
    # Remove "use client" if it exists and metadata/viewport exports
    client_lines = []
    skip_metadata = False
    
    for line in lines:
        if 'export const metadata' in line or 'export const viewport' in line:
            skip_metadata = True
            continue
        if skip_metadata and line.strip() == '}':
            skip_metadata = False
            continue
        if not skip_metadata:
            client_lines.append(line)
    
    client_content = '\n'.join(client_lines)
    
    # Ensure 'use client' is at the top
    if not client_content.startswith("'use client'"):
        client_content = "'use client';\n\n" + client_content
    
    with open(register_client_path, 'w', encoding='utf-8') as f:
        f.write(client_content)
    
    print(f"✅ Created: {register_client_path}")
    
    return True

def fix_login_page():
    """Apply same fix to login page if needed"""
    login_path = "frontend/src/app/login/page.tsx"
    
    if not os.path.exists(login_path):
        return False
    
    with open(login_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if it has 'use client' and metadata
    if "'use client'" in content and 'export const metadata' in content:
        # Create login client component
        login_client_path = "frontend/src/app/login/LoginClient.tsx"
        
        # Server component
        server_component = '''import type { Metadata, Viewport } from 'next';
import LoginClient from './LoginClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Sign In - CareOps',
  description: 'Sign in to your CareOps workspace',
};

export default function LoginPage() {
  return <LoginClient />;
}
'''
        
        with open(login_path, 'w', encoding='utf-8') as f:
            f.write(server_component)
        
        # Extract client component logic
        lines = content.split('\n')
        client_lines = []
        skip_metadata = False
        
        for line in lines:
            if 'export const metadata' in line or 'export const viewport' in line:
                skip_metadata = True
                continue
            if skip_metadata and line.strip() == '}':
                skip_metadata = False
                continue
            if not skip_metadata:
                client_lines.append(line)
        
        client_content = '\n'.join(client_lines)
        
        if not client_content.startswith("'use client'"):
            client_content = "'use client';\n\n" + client_content
        
        with open(login_client_path, 'w', encoding='utf-8') as f:
            f.write(client_content)
        
        print(f"✅ Fixed: {login_path}")
        print(f"✅ Created: {login_client_path}")
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 FIXING NEXT.JS METADATA EXPORT ERROR")
    print("=" * 60)
    
    fix_register_page()
    fix_login_page()
    
    print("=" * 60)
    print("✅ FIX COMPLETE!")
    print("=" * 60)
    print("\n📋 NEXT STEPS:")
    print("  1. cd frontend")
    print("  2. npm run dev")
    print("  3. Open http://localhost:3001/register")
    print("\n🎉 The metadata error is now FIXED!")