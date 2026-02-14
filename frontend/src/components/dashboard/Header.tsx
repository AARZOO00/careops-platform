'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  CloudIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import WeatherWidget from '@/components/ui/WeatherWidget';

export default function Header({ 
  onRefresh, 
  onDateRangeChange, 
  selectedDateRange,
  onSearchOpen 
}: any) {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState(3);
  const { user } = useAuthStore();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-8 shadow-2xl"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-90" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* User avatar with online status */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            </div>
            
            {/* Greeting text */}
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white"
              >
                {greeting}, {user?.full_name?.split(' ')[0] || 'Admin'}! 👋
              </motion.h1>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center mt-2 space-x-4"
              >
                <div className="flex items-center text-white/90 text-sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(currentTime, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="flex items-center text-white/90 text-sm">
                  <SparklesIcon className="w-4 h-4 mr-2 text-yellow-300" />
                  {notifications} new insights
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Weather widget */}
            <WeatherWidget />

            {/* Date range picker */}
            <div className="relative group">
              <button className="flex items-center px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-white/20 transition-all">
                <span className="text-sm font-medium capitalize">{selectedDateRange}</span>
                <ChevronDownIcon className="w-4 h-4 ml-2 group-hover:rotate-180 transition-transform" />
              </button>
            </div>

            {/* Refresh button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </motion.button>

            {/* Notification bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <BellIcon className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                  {notifications}
                </span>
              )}
            </motion.button>

            {/* Settings gear */}
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <SunIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Quick actions bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center space-x-4 mt-8"
        >
          {/* Search button */}
          <button
            onClick={onSearchOpen}
            className="flex-1 flex items-center px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-white/70 group-hover:text-white" />
            <span className="ml-3 text-white/70 group-hover:text-white">Quick search...</span>
            <span className="ml-auto px-3 py-1.5 bg-white/20 rounded-lg text-xs text-white/90">
              ⌘K
            </span>
          </button>

          {/* New booking button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-4 bg-white text-gray-900 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all group"
          >
            <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            New Booking
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.div>
  );
}