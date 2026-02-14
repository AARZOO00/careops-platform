'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  BellAlertIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface AIInsightsProps {
  data?: any;
}

export default function AIInsights({ data }: AIInsightsProps) {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const insights = [
    {
      id: 1,
      type: 'prediction',
      icon: ChartBarIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Revenue forecast',
      message: 'You\'ll likely make $3,240 tomorrow - 23% above average',
      action: 'View details',
      confidence: 92,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      type: 'anomaly',
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Anomaly detected',
      message: 'Revenue is up 34% today. New marketing campaign?',
      action: 'Investigate',
      confidence: 88,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 3,
      type: 'suggestion',
      icon: LightBulbIcon,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      title: 'Smart suggestion',
      message: '3 customers haven\'t confirmed their appointments. Send reminder?',
      action: 'Send now',
      confidence: 95,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 4,
      type: 'pattern',
      icon: CalendarIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Pattern detected',
      message: 'Fridays are 47% busier than other weekdays. Consider extending hours?',
      action: 'Adjust schedule',
      confidence: 97,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 5,
      type: 'alert',
      icon: BellAlertIcon,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Stock alert',
      message: 'Printer paper will run out in 3 days. Reorder now?',
      action: 'Reorder',
      confidence: 99,
      gradient: 'from-red-500 to-rose-500'
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentInsight((currentInsight + 1) % insights.length);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <div className="relative p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              <p className="text-sm text-gray-400">Powered by predictive analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">
              {insights[currentInsight].confidence}% confidence
            </span>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 ${insights[currentInsight].iconBg} rounded-xl`}>
                {(() => {
                  const Icon = insights[currentInsight].icon;
                  return <Icon className={`w-6 h-6 ${insights[currentInsight].iconColor}`} />;
                })()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {insights[currentInsight].title}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    AI generated
                  </span>
                </div>
                
                <p className="text-lg text-white mb-4">
                  {insights[currentInsight].message}
                </p>
                
                <div className="flex items-center justify-between">
                  <button className="group flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    {insights[currentInsight].action}
                    <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Confidence</span>
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${insights[currentInsight].confidence}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className={`h-full bg-gradient-to-r ${insights[currentInsight].gradient}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500">Forecast</span>
            </div>
            <p className="text-lg font-semibold text-white">$3,240</p>
            <p className="text-xs text-green-400">+23% vs avg</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">Bookings</span>
            </div>
            <p className="text-lg font-semibold text-white">32</p>
            <p className="text-xs text-blue-400">+8 tomorrow</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <UserGroupIcon className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Peak hour</span>
            </div>
            <p className="text-lg font-semibold text-white">2:00 PM</p>
            <p className="text-xs text-purple-400">45% capacity</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}