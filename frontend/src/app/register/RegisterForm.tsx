'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { 
  BuildingOfficeIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  workspace_name: string;
}

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      workspace_name: '',
      full_name: '',
      email: '',
      password: '',
      confirm_password: ''
    }
  });
  
  const { setToken, setUser } = useAuthStore();
  const password = watch('password');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      setRegisterError(null);
      
      if (data.password !== data.confirm_password) {
        setRegisterError('Passwords do not match');
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      console.log('📝 Registering at:', `${API_URL}/api/auth/register`);
      
      const { confirm_password, ...registerData } = data;
      
      const response = await axios.post(`${API_URL}/api/auth/register`, registerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const { access_token } = response.data;
      
      setToken(access_token);
      
      const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser(userResponse.data);
      toast.success('Workspace created successfully!');
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      setRegisterError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your workspace</h2>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {registerError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-shake">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{registerError}</div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Business Name */}
            <div>
              <label htmlFor="workspace_name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('workspace_name', { 
                    required: 'Business name is required',
                    minLength: {
                      value: 2,
                      message: 'Business name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.workspace_name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="Acme Inc."
                  disabled={loading}
                />
              </div>
              {errors.workspace_name && (
                <p className="mt-1 text-xs text-red-600">{errors.workspace_name.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('full_name', { 
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Full name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="you@company.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[0-9])/,
                      message: 'Must contain one uppercase letter and one number'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirm_password', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Password Strength Indicator */}
            <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-indigo-500" />
                Password requirements:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-xs">
                  <CheckCircleIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${
                    password?.length >= 8 ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  <span className={password?.length >= 8 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    8+ characters
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircleIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${
                    /[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  <span className={/[A-Z]/.test(password) ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    Uppercase letter
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircleIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${
                    /[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  <span className={/[0-9]/.test(password) ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    One number
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircleIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${
                    password && password === watch('confirm_password') ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  <span className={password && password === watch('confirm_password') ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    Passwords match
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating workspace...
                </>
              ) : (
                <>
                  Create Workspace
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-gray-500 mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center space-x-6">
          <div className="flex items-center text-xs text-gray-600">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <CheckCircleIcon className="h-3 w-3 text-green-600" />
            </div>
            SSL Secure
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <CheckCircleIcon className="h-3 w-3 text-green-600" />
            </div>
            GDPR Compliant
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <CheckCircleIcon className="h-3 w-3 text-green-600" />
            </div>
            14-day free trial
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}