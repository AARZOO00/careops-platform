import { create } from 'zustand';
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
);