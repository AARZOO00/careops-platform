'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  DeviceTabletIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/useToast';

export default function SecurityTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const { showToast } = useToast();

  const loginHistory = [
    {
      id: 1,
      device: 'Windows PC',
      browser: 'Chrome 121.0',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      time: new Date(),
      status: 'success'
    },
    {
      id: 2,
      device: 'MacBook Pro',
      browser: 'Safari 17.0',
      location: 'Los Angeles, CA',
      ip: '192.168.1.2',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      id: 3,
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'San Francisco, CA',
      ip: '192.168.1.3',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'failed'
    }
  ];

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'crop_live_••••••••••••••••',
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'crop_dev_••••••••••••••••',
      created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 mt-1">
                  {twoFactorEnabled ? 'Enabled - Extra security layer' : 'Disabled - Recommended'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                showToast('success', twoFactorEnabled ? '2FA disabled' : '2FA enabled');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Login History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900">Login History</h3>
          <p className="text-sm text-gray-500 mt-1">Recent activity on your account</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    login.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DeviceTabletIcon className={`w-5 h-5 ${
                      login.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{login.device}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        login.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {login.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {login.browser} · {login.location} · {login.ip}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {login.time.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your API access tokens</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CodeBracketIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{key.name}</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{key.key}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {key.created.toLocaleDateString()} · Last used: {key.lastUsed.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Revoke
                </button>
              </div>
            ))}
          </div>
          
          <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            + Generate New API Key
          </button>
        </div>
      </motion.div>
    </div>
  );
}