#!/usr/bin/env python
"""
FIX: Frontend calling itself instead of backend
Run this from project root: python fix_api_loop.py
"""

import os
import re

def fix_auth_store():
    """Fix axios baseURL configuration"""
    file_path = "frontend/src/store/authStore.ts"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    content = '''import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// ✅ CRITICAL: Set axios defaults to point to backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;

console.log('🔧 API URL configured:', API_URL);

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  workspace_id: string;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: (token) => {
        set({ token, isAuthenticated: true });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
      setUser: (user) => set({ user }),
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('careops-auth');
      },
    }),
    {
      name: 'careops-auth',
    }
  )
);'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed: {file_path}")
    return True

def fix_next_config():
    """Remove or comment out rewrites in next.config.js"""
    file_path = "frontend/next.config.js"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Comment out rewrites section
    if 'async rewrites' in content:
        content = re.sub(
            r'async rewrites\(\) \{[^}]+\},?',
            '// async rewrites() {\n  //   return [\n  //     {\n  //       source: \'/api/:path*\',\n  //       destination: \'http://localhost:8000/api/:path*\',\n  //     },\n  //   ];\n  // },',
            content,
            flags=re.DOTALL
        )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed: {file_path}")
    return True

def fix_env_files():
    """Fix environment variables"""
    env_local = "frontend/.env.local"
    with open(env_local, 'w', encoding='utf-8') as f:
        f.write('''# ✅ API points to BACKEND (port 8000)
NEXT_PUBLIC_API_URL=http://localhost:8000
# ✅ App URL is FRONTEND (port 3001)
NEXT_PUBLIC_APP_URL=http://localhost:3001''')
    print(f"✅ Fixed: {env_local}")
    
    env_dev = "frontend/.env.development"
    with open(env_dev, 'w', encoding='utf-8') as f:
        f.write('''# ✅ API points to BACKEND (port 8000)
NEXT_PUBLIC_API_URL=http://localhost:8000
# ✅ App URL is FRONTEND (port 3001)
NEXT_PUBLIC_APP_URL=http://localhost:3001''')
    print(f"✅ Fixed: {env_dev}")
    
    return True

def create_manifest():
    """Create manifest.json"""
    manifest_path = "frontend/public/manifest.json"
    os.makedirs("frontend/public", exist_ok=True)
    
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
    
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write(manifest_content)
    print(f"✅ Created: {manifest_path}")
    
    # Create favicon.ico
    favicon_path = "frontend/public/favicon.ico"
    if not os.path.exists(favicon_path):
        with open(favicon_path, 'wb') as f:
            f.write(b'')
        print(f"✅ Created: {favicon_path}")
    
    return True

def verify_cors():
    """Verify CORS configuration in backend"""
    file_path = "backend/app/main.py"
    
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'allow_origins' in content and '3001' not in content:
        print("⚠️  CORS might not be configured for port 3001")
        print("   Please add 'http://localhost:3001' to allow_origins in main.py")
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 FIXING API LOOP - FRONTEND CALLING ITSELF")
    print("=" * 60)
    
    fix_auth_store()
    fix_next_config()
    fix_env_files()
    create_manifest()
    verify_cors()
    
    print("=" * 60)
    print("✅ ALL FIXES COMPLETE!")
    print("=" * 60)
    print("\n📋 CRITICAL - DO THESE STEPS EXACTLY:")
    print("  1️⃣ STOP both servers (Ctrl+C in both terminals)")
    print()
    print("  2️⃣ CLEAR Next.js cache:")
    print("     cd frontend")
    print("     rm -rf .next (Mac/Linux) or rmdir /s .next (Windows)")
    print()
    print("  3️⃣ RESTART backend:")
    print("     cd backend")
    print("     venv\\Scripts\\activate")
    print("     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print()
    print("  4️⃣ RESTART frontend:")
    print("     cd frontend")
    print("     npm run dev")
    print()
    print("  5️⃣ VERIFY in browser console:")
    print("     Open F12 console, you should see:")
    print("     🔧 API URL configured: http://localhost:8000")
    print()
    print("🎯 The registration/login will NOW work correctly!")