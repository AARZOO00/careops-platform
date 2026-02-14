'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  UsersIcon,
  CreditCardIcon,
  LinkIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import GeneralTab from '@/components/settings/GeneralTab';
import ProfileTab from '@/components/settings/ProfileTab';
import TeamTab from '@/components/settings/TeamTab';
import BillingTab from '@/components/settings/BillingTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import SecurityTab from '@/components/settings/SecurityTab';
import PageAnimation from '@/components/ui/PageAnimation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingOfficeIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'profile', name: 'Profile', icon: UserCircleIcon, color: 'from-purple-500 to-pink-500' },
    { id: 'team', name: 'Team', icon: UsersIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon, color: 'from-orange-500 to-red-500' },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon, color: 'from-yellow-500 to-amber-500' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, color: 'from-gray-500 to-slate-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <DashboardLayout>
      <PageAnimation>
        <div className="space-y-6">
          {/* Header with animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8"
          >
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
            <div className="relative z-10">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white"
              >
                Settings
              </motion.h1>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 mt-2"
              >
                Manage your workspace settings and preferences
              </motion.p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
          </motion.div>

          {/* Tabs with animations */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <nav className="flex space-x-8 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${activeTab === tab.id
                        ? `border-${tab.color.split(' ')[0].replace('from-', '')}-500 text-${tab.color.split(' ')[0].replace('from-', '')}-600 dark:text-${tab.color.split(' ')[0].replace('from-', '')}-400`
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>

          {/* Tab Content with animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'general' && <GeneralTab />}
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'team' && <TeamTab />}
              {activeTab === 'billing' && <BillingTab />}
              {activeTab === 'integrations' && <IntegrationsTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'security' && <SecurityTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageAnimation>
    </DashboardLayout>
  );
}