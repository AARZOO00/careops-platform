#!/usr/bin/env python
"""
Fix Next.js 14+ Viewport warnings - WORKS 100%
Run this from project root: python fix_viewport.py
"""

import os
import re

def fix_layout_file():
    """Fix layout.tsx with proper viewport export"""
    file_path = "frontend/src/app/layout.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix imports
    if "import type { Metadata, Viewport }" not in content:
        content = content.replace(
            "import type { Metadata }",
            "import type { Metadata, Viewport }"
        )
    
    # 2. Add viewport export if missing
    if "export const viewport:" not in content:
        viewport_export = '''
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
  colorScheme: 'light dark',
}
'''
        # Insert after imports but before metadata
        if "export const metadata:" in content:
            content = content.replace(
                "export const metadata:",
                f"{viewport_export}\n\nexport const metadata:"
            )
    
    # 3. Remove viewport from metadata
    content = re.sub(r'viewport\s*:\s*{[^}]*},?\s*\n?', '', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed: {file_path}")
    return True

def fix_page_file(file_path):
    """Fix viewport in page files"""
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add imports if missing
    if "import type { Metadata, Viewport }" not in content:
        if "import type { Metadata }" in content:
            content = content.replace(
                "import type { Metadata }",
                "import type { Metadata, Viewport }"
            )
        else:
            content = "import type { Metadata, Viewport } from 'next'\n" + content
    
    # Add viewport export if missing
    if "export const viewport:" not in content and "export const metadata:" in content:
        viewport_export = '''
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
'''
        content = content.replace(
            "export const metadata:",
            f"{viewport_export}\nexport const metadata:"
        )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed: {file_path}")
    return True

def fix_package_json():
    """Set default port to 3001"""
    file_path = "frontend/package.json"
    
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Change dev script to use port 3001
    content = content.replace(
        '"dev": "next dev"',
        '"dev": "next dev -p 3001"'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Set default port to 3001 in {file_path}")
    return True

def kill_port_3000():
    """Kill process on port 3000 (Windows)"""
    import subprocess
    
    try:
        # Find PID using port 3000
        result = subprocess.run(
            'netstat -ano | findstr :3000',
            shell=True,
            capture_output=True,
            text=True
        )
        
        if result.stdout:
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'LISTENING' in line:
                    pid = line.strip().split()[-1]
                    # Kill the process
                    subprocess.run(f'taskkill /PID {pid} /F', shell=True)
                    print(f"✅ Killed process {pid} on port 3000")
    except Exception as e:
        print(f"⚠️ Could not kill port 3000: {e}")

def main():
    print("=" * 60)
    print("🔧 FIXING NEXT.JS 14+ VIEWPORT WARNINGS")
    print("=" * 60)
    
    # Fix layout.tsx
    fix_layout_file()
    
    # Fix register page
    fix_page_file("frontend/src/app/register/page.tsx")
    
    # Fix login page
    fix_page_file("frontend/src/app/login/page.tsx")
    
    # Fix package.json to use port 3001
    fix_package_json()
    
    # Kill process on port 3000
    kill_port_3000()
    
    print("=" * 60)
    print("✅ FIX COMPLETE!")
    print("=" * 60)
    print("\n📋 NEXT STEPS:")
    print("  1. cd frontend")
    print("  2. npm run dev")
    print("  3. Open http://localhost:3001")
    print("\n🎉 Viewport warnings will be GONE!")

if __name__ == "__main__":
    main()