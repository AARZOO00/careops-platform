'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/useToast';

export default function BillingTab() {
  const { showToast } = useToast();

  const handleUpgrade = () => {
    showToast('success', 'Plan upgraded successfully');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          <p className="text-sm text-gray-500 mt-1">Your subscription details</p>
        </div>
        
        <div className="p-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Professional Plan</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  $79<span className="text-lg font-normal text-gray-500">/month</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Up to 20 team members
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Unlimited bookings
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 mr-1" />
              Next billing date: March 15, 2026
            </div>
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}