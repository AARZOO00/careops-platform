'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface ActivateStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ActivateStep({ onComplete, onBack }: ActivateStepProps) {
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    setActivating(true);
    setTimeout(() => {
      setActivating(false);
      setActivated(true);
      setTimeout(() => onComplete(), 1500);
    }, 2000);
  };

  if (activated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <CheckCircleIcon className="relative w-20 h-20 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Workspace Activated! 🎉</h2>
        <p className="text-gray-600 mb-8">Your workspace is now ready. Redirecting to dashboard...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20" />
            <RocketLaunchIcon className="relative w-16 h-16 text-purple-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Launch?</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          You've completed all setup steps. Activate your workspace to start accepting bookings.
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">Before you activate:</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Communication channels configured</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>At least one service with availability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Business information complete</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleActivate}
          disabled={activating}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {activating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Activating...
            </>
          ) : (
            <>
              <RocketLaunchIcon className="w-5 h-5" />
              Activate Workspace
            </>
          )}
        </button>
      </div>
    </div>
  );
}