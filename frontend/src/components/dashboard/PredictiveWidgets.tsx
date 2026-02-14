'use client';

import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface PredictiveWidgetsProps {
  predictions?: {
    tomorrowRevenue?: number;
    tomorrowBookings?: number;
    peakHour?: string;
    confidence?: number;
  };
}

export default function PredictiveWidgets({ predictions = {} }: PredictiveWidgetsProps) {
  const {
    tomorrowRevenue = 3240,
    tomorrowBookings = 32,
    peakHour = '2:00 PM',
    confidence = 92
  } = predictions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Predictions</h3>
      
      <div className="space-y-4">
        {/* Tomorrow's Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 ml-2">Tomorrow's Revenue</span>
            </div>
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${tomorrowRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 23% above average</p>
        </div>

        {/* Tomorrow's Bookings */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 ml-2">Expected Bookings</span>
            </div>
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{tomorrowBookings}</p>
          <p className="text-xs text-green-600 mt-1">↑ 8 more than today</p>
        </div>

        {/* Peak Hour */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 ml-2">Peak Hour</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{peakHour}</p>
          <p className="text-xs text-orange-600 mt-1">45% capacity</p>
        </div>

        {/* Confidence Score */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 ml-2">AI Confidence</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{confidence}%</p>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
        View Full Forecast
      </button>
    </motion.div>
  );
}