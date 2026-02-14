'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Set auth header for all requests
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Interceptor for handling 401 responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, logout]);

  // ✅ FIX: Only protect dashboard routes, NOT the landing page
  useEffect(() => {
    // Public paths that don't require authentication
    const publicPaths = ['/', '/login', '/register', '/public'];
    const isPublicPath = publicPaths.some(path => pathname === path || pathname?.startsWith('/public'));

    // Only redirect to login if trying to access protected pages while not authenticated
    if (!isAuthenticated && !isPublicPath && pathname !== '/' && !pathname?.startsWith('/public')) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}