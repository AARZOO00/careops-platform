'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/useToast';

const integrations = [
  {
    name: 'SendGrid',
    description: 'Email delivery service',
    icon: EnvelopeIcon,
    status: 'connected',
    color: 'blue'
  },
  {
    name: 'Twilio',
    description: 'SMS and voice communications',
    icon: PhoneIcon,
    status: 'connected',
    color: 'red'
  },
  {
    name: 'Google Calendar',
    description: 'Calendar synchronization',
    icon: CalendarIcon,
    status: 'disconnected',
    color: 'green'
  },
  {
    name: 'Stripe',
    description: 'Payment processing',
    icon: 'CurrencyDollarIcon',
    status: 'disconnected',
    color: 'purple'
  },
  {
    name: 'Zapier',
    description: 'Workflow automation',
    icon: LinkIcon,
    status: 'disconnected',
    color: 'orange'
  }
];

export default function IntegrationsTab() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleConnect = (name: string) => {
    showToast('success', `Connected to ${name}`);
  };

  const handleDisconnect = (name: string) => {
    showToast('info', `Disconnected from ${name}`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {integrations.map((integration, index) => {
          const Icon = integration.icon;
          return (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-${integration.color}-100 rounded-xl`}>
                    <Icon className={`w-6 h-6 text-${integration.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                  </div>
                </div>
                {integration.status === 'connected' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Disconnected
                  </span>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                {integration.status === 'connected' ? (
                  <button
                    onClick={() => handleDisconnect(integration.name)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.name)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}