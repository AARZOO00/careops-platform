'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  XCircleIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  
  const { setToken, setUser } = useAuthStore();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setLoginError(null);
      
      console.log('🔐 Logging in to:', `${API_URL}/api/auth/token`);
      
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.append('password', data.password);

      const response = await axios.post(`${API_URL}/api/auth/token`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token } = response.data;
      setToken(access_token);
      
      const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser(userResponse.data);
      toast.success('Welcome back!');
      
      const onboardingResponse = await axios.get(`${API_URL}/api/onboarding/status`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      if (onboardingResponse.data.is_active) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Invalid email or password';
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* LEFT SECTION - BRAND & BRANDING (DESKTOP ONLY) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          {/* Logo & Brand Name */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="mt-6 text-4xl font-bold text-white tracking-tight">CareOps</h1>
          </div>

          {/* Main Tagline */}
          <div className="max-w-md space-y-6">
            <div>
              <h2 className="text-5xl font-bold text-white leading-tight mb-4">
                Manage your operations with confidence.
              </h2>
              <p className="text-lg text-indigo-100">
                A unified platform designed for modern service businesses. One place for bookings, messaging, inventory, and analytics.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-400/30 border border-green-400 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-green-200" />
                </div>
                <span className="text-white/90 font-medium">Secure & SOC2 Type II Compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-400/30 border border-green-400 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-green-200" />
                </div>
                <span className="text-white/90 font-medium">Simple & Intuitive</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-400/30 border border-green-400 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-green-200" />
                </div>
                <span className="text-white/90 font-medium">Reliable & Always Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Brand Info */}
        <div className="relative z-10">
          <p className="text-sm text-indigo-200">
            Trusted by 1000+ businesses worldwide
          </p>
        </div>
      </div>

      {/* RIGHT SECTION - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo - Visible only on small screens */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">CareOps</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 sm:p-12">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Welcome back <span className="text-4xl">👋</span>
              </h2>
              <p className="mt-3 text-base text-gray-600">
                Sign in to your workspace to continue
              </p>
            </div>

            {/* Error Alert */}
            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{loginError}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-3">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('username', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    type="email"
                    className={`block w-full pl-12 pr-4 h-12 border ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    } rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-transparent transition-all`}
                    placeholder="you@company.com"
                    disabled={loading}
                    aria-invalid={errors.username ? 'true' : 'false'}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                </div>
                {errors.username && (
                  <p id="username-error" className="mt-2 text-sm text-red-600 font-medium">{errors.username.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full pl-12 pr-12 h-12 border ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    } rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                    disabled={loading}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    {...register('remember')}
                    id="remember"
                    type="checkbox"
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-3 block text-sm text-gray-700 cursor-pointer font-medium">
                    Remember me
                  </label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex justify-center items-center px-6 text-base font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:from-indigo-800 active:to-indigo-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon className="ml-3 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Create your workspace
              </Link>
            </p>

            {/* Demo Credentials - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-blue-900">Demo Credentials</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-blue-700 font-medium">Email:</p>
                        <p className="font-mono font-semibold text-gray-900 mt-1">admin@demo.com</p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium">Password:</p>
                        <p className="font-mono font-semibold text-gray-900 mt-1">demo123456</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Statement */}
          <div className="mt-8 text-center text-xs text-gray-500 space-y-2">
            <p>🔒 Enterprise-grade security • SOC2 Type II • GDPR Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
