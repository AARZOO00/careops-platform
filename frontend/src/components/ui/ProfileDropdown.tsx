'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  ChartBarIcon,
  BookmarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description?: string;
  badge?: string;
}

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const menuItems: MenuItem[] = [
    { 
      icon: UserIcon, 
      label: 'My Profile', 
      href: '/settings/profile',
      description: 'View and edit your personal information'
    },
    { 
      icon: ShieldCheckIcon, 
      label: 'Security', 
      href: '/settings/security',
      description: 'Password, 2FA, and session management'
    },
    { 
      icon: CreditCardIcon, 
      label: 'Billing', 
      href: '/settings/billing',
      description: 'Plans, payments, and invoices',
      badge: 'Pro'
    },
    { 
      icon: BellIcon, 
      label: 'Notifications', 
      href: '/settings/notifications',
      description: 'Email, SMS, and push preferences'
    },
    { 
      icon: ChartBarIcon, 
      label: 'Usage & Analytics', 
      href: '/dashboard?tab=analytics',
      description: 'View your platform usage stats'
    },
    { 
      icon: BookmarkIcon, 
      label: 'Saved Items', 
      href: '/saved',
      description: 'Your bookmarked content'
    },
    { 
      icon: Cog6ToothIcon, 
      label: 'Settings', 
      href: '/settings',
      description: 'General workspace settings'
    },
    { 
      icon: QuestionMarkCircleIcon, 
      label: 'Help & Support', 
      href: '/support',
      description: 'Documentation and contact us'
    },
  ];

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.full_name || 'Admin User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.role || 'Administrator'}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* User Info with Animation */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold shadow-lg"
                >
                  {user?.full_name?.charAt(0) || 'A'}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.full_name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {user?.email || 'admin@demo.com'}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      Active
                    </span>
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full">
                      Pro Plan
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Menu Items with Staggered Animation */}
            <div className="p-2 max-h-96 overflow-y-auto">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-start space-x-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group relative"
                  >
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-primary-600 dark:text-primary-400">→</span>
                    </motion.div>
                  </motion.button>
                );
              })}

              {/* Dark Mode Toggle */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + menuItems.length * 0.05 }}
                className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2"
              >
                <button
                  onClick={() => {
                    toggleDarkMode();
                    toast.success(`${darkMode ? 'Light' : 'Dark'} mode activated`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                      {darkMode ? (
                        <SunIcon className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <MoonIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <motion.div 
                    animate={{ x: darkMode ? 4 : 0 }}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: darkMode ? 20 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </motion.div>
                </button>
              </motion.div>

              {/* Logout Button */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (menuItems.length + 1) * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group mt-1"
              >
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/30 transition-colors">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>

            {/* Footer with Version */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Version 2.0.0 • © 2026 CareOps
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}