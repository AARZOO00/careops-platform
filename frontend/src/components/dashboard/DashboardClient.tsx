'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from './Header';
import StatsGrid from './StatsGrid';
import UpcomingBookings from './UpcomingBookings';
import ActivityFeed from './ActivityFeed';
import AIInsights from './AIInsights';
import Charts from './Charts';
import PredictiveWidgets from './PredictiveWidgets';
import ChatAssistant from '@/components/ai/ChatAssistant';
import SmartSearch from '@/components/ai/SmartSearch';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { demoData } from '@/lib/demo-data';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { ArrowPathIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface DashboardClientProps {
  data?: any;
}

export default function DashboardClient({ data = demoData }: DashboardClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [greeting, setGreeting] = useState('');
  const { realtimeData, isLoading, refresh } = useRealtimeData(data);

  useKeyboardShortcut('k', () => setSearchOpen(true), { ctrl: true });
  useKeyboardShortcut('escape', () => setSearchOpen(false));

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute inset-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">C</span>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatePresence>
        {searchOpen && <SmartSearch onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      <ChatAssistant />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-4 lg:p-6"
      >
        {/* Animated Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-8 shadow-2xl"
        >
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [null, Math.random() * 100 + '%'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white"
                >
                  {greeting}, Admin! 👋
                </motion.h1>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center mt-2 space-x-4"
                >
                  <div className="flex items-center text-white/90 text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center text-white/90 text-sm">
                    <SparklesIcon className="w-4 h-4 mr-2 text-yellow-300 animate-pulse" />
                    3 new insights
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={refresh}
                className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-white/20 transition-all"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Quick actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-4 mt-8"
            >
              <button
                onClick={() => setSearchOpen(true)}
                className="flex-1 flex items-center px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-white/70 group-hover:text-white" />
                <span className="ml-3 text-white/70 group-hover:text-white">Quick search...</span>
                <span className="ml-auto px-3 py-1.5 bg-white/20 rounded-lg text-xs text-white/90">
                  ⌘K
                </span>
              </button>

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
        </motion.div>

        {/* Stats Grid with animations */}
        <StatsGrid data={realtimeData} />

        {/* AI Insights Card */}
        <AIInsights data={realtimeData} />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <UpcomingBookings  />
            <Charts data={realtimeData} />
          </div>

          <div className="space-y-8">
            <ActivityFeed  />
            <PredictiveWidgets predictions={realtimeData?.predictions || {}} />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}