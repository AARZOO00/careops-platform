'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  UsersIcon,
  CubeIcon,
  CalendarIcon,
  DocumentTextIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  PencilIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XCircleIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const { user } = useAuthStore();

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingOfficeIcon },
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'team', name: 'Team', icon: UsersIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  // Demo team members
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastActive: new Date() },
    { id: '2', name: 'Maria Chen', email: 'maria@example.com', role: 'Staff', status: 'active', lastActive: new Date(Date.now() - 3600000) },
    { id: '3', name: 'Elena Rodriguez', email: 'elena@example.com', role: 'Staff', status: 'inactive', lastActive: new Date(Date.now() - 86400000 * 2) },
  ]);

  // Demo API keys
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API Key', key: 'crop_live_••••••••••••••••', created: new Date(Date.now() - 30 * 86400000), lastUsed: new Date(Date.now() - 2 * 86400000) },
    { id: '2', name: 'Development API Key', key: 'crop_dev_••••••••••••••••', created: new Date(Date.now() - 7 * 86400000), lastUsed: new Date(Date.now() - 1 * 86400000) },
  ]);

  const [notifications, setNotifications] = useState({
    email: {
      bookingConfirmations: true,
      reminderEmails: true,
      newMessageAlerts: true,
      formSubmissions: true,
      inventoryAlerts: true,
      weeklySummary: false
    },
    sms: {
      bookingConfirmations: true,
      reminderMessages: true,
      criticalAlerts: true
    }
  });

  const SettingSection = ({ title, description, children }: any) => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ label, value, action, badge, children }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {value && <p className="text-sm text-gray-500 mt-0.5">{value}</p>}
        {children}
      </div>
      <div className="flex items-center space-x-3">
        {badge && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
        {action && (
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            <PencilIcon className="h-4 w-4 mr-1" />
            {action}
          </button>
        )}
      </div>
    </div>
  );

  // Password Change Modal
  const PasswordModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPasswordModal(false)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real app, this would update the password
                setShowPasswordModal(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Invite Team Member Modal
  const InviteModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowInviteModal(false)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add a personal message..."
                />
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real app, this would send the invitation
                setShowInviteModal(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // API Key Modal
  const ApiKeyModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowApiModal(false)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create API Key</h3>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Production API Key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="full">Full Access</option>
                  <option value="read">Read Only</option>
                  <option value="write">Write Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="never">Never expires</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowApiModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real app, this would create the API key
                setShowApiModal(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Create API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // General Tab
  const GeneralTab = () => (
    <div className="space-y-6">
      <SettingSection title="Business Information" description="Manage your business details">
        <SettingRow label="Business Name" value="Demo Workspace" action="Edit" />
        <SettingRow label="Business Email" value="hello@demoworkspace.com" action="Edit" />
        <SettingRow label="Business Phone" value="+1 (555) 123-4567" action="Edit" />
        <SettingRow label="Address" value="123 Main St, San Francisco, CA 94105" action="Edit" />
        <SettingRow label="Time Zone" value="America/Los_Angeles (PT)" action="Edit" />
        <SettingRow label="Currency" value="USD ($)" action="Edit" badge="Default" />
      </SettingSection>

      <SettingSection title="Branding" description="Customize your workspace appearance">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Company Logo</p>
            <p className="text-sm text-gray-500 mt-0.5">Upload your company logo</p>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Upload
          </button>
        </div>
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">Brand Color</p>
            <p className="text-sm text-gray-500 mt-0.5">Primary color for your workspace</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-md"></div>
            <div className="w-8 h-8 bg-purple-600 rounded-full border-2 border-white shadow-md"></div>
            <div className="w-8 h-8 bg-pink-600 rounded-full border-2 border-white shadow-md"></div>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Change
            </button>
          </div>
        </div>
      </SettingSection>
    </div>
  );

  // Profile Tab
  const ProfileTab = () => (
    <div className="space-y-6">
      <SettingSection title="Profile Information" description="Update your personal information">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
              <PencilIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.full_name || 'Admin User'}</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
        <SettingRow label="Full Name" value={user?.full_name || 'Admin User'} action="Edit" />
        <SettingRow label="Email Address" value={user?.email || 'admin@demo.com'} action="Edit" />
        <SettingRow label="Phone Number" value="+1 (555) 987-6543" action="Edit" />
        <SettingRow label="Job Title" value="Business Owner" action="Edit" />
      </SettingSection>
    </div>
  );

  // Team Tab
  const TeamTab = () => (
    <div className="space-y-6">
      <SettingSection title="Team Members" description="Manage who has access to your workspace">
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-700">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Last active {format(member.lastActive, 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {member.status}
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {member.role}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-red-600">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Invite Team Member
          </button>
        </div>
      </SettingSection>
    </div>
  );

  // Billing Tab
  const BillingTab = () => (
    <div className="space-y-6">
      <SettingSection title="Current Plan" description="Your subscription details">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900">Professional</p>
              <p className="text-sm text-gray-500 mt-2">$49/month · Billed monthly</p>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Active
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
              Up to 10 team members
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
              Unlimited bookings
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
              Email & SMS
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
              Priority support
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Next billing date</p>
            <p className="text-sm text-gray-500 mt-0.5">March 15, 2026</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Upgrade Plan
          </button>
        </div>
      </SettingSection>

      <SettingSection title="Payment Method" description="Manage your payment information">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">VISA ending in 4242</p>
              <p className="text-xs text-gray-500 mt-0.5">Expires 12/2026</p>
            </div>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Update
          </button>
        </div>
        <div className="mt-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add payment method
          </button>
        </div>
      </SettingSection>

      <SettingSection title="Billing History" description="View past invoices">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Invoice #{String(1000 + i).slice(1)}</p>
                <p className="text-xs text-gray-500 mt-0.5">February {i}, 2026</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-gray-900">$49.00</p>
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  );

  // Integrations Tab
  const IntegrationsTab = () => (
    <div className="space-y-6">
      <SettingSection title="Email Integration" description="Connect your email provider">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">SendGrid</p>
              <p className="text-xs text-gray-500 mt-0.5">Connected · hello@demoworkspace.com</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Active
          </span>
        </div>
        <div className="mt-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add another provider
          </button>
        </div>
      </SettingSection>

      <SettingSection title="SMS Integration" description="Connect your SMS provider">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg">
              <PhoneIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Twilio</p>
              <p className="text-xs text-gray-500 mt-0.5">Connected · +1 (555) 123-4567</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Active
          </span>
        </div>
      </SettingSection>

      <SettingSection title="Calendar Integration" description="Connect your calendar">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Google Calendar</p>
              <p className="text-xs text-gray-500 mt-0.5">Not connected</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Connect
          </button>
        </div>
      </SettingSection>
    </div>
  );

  // Notifications Tab
  const NotificationsTab = () => (
    <div className="space-y-6">
      <SettingSection title="Email Notifications" description="Choose what emails you receive">
        {Object.entries(notifications.email).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <p className="text-sm text-gray-900">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={value}
                onChange={() => setNotifications({
                  ...notifications,
                  email: { ...notifications.email, [key]: !value }
                })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </SettingSection>

      <SettingSection title="SMS Notifications" description="Choose what SMS you receive">
        {Object.entries(notifications.sms).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <p className="text-sm text-gray-900">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={value}
                onChange={() => setNotifications({
                  ...notifications,
                  sms: { ...notifications.sms, [key]: !value }
                })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </SettingSection>
    </div>
  );

  // Security Tab
  const SecurityTab = () => (
    <div className="space-y-6">
      <SettingSection title="Password" description="Manage your password">
        <SettingRow label="Password" value="••••••••" action="Change" />
        <SettingRow label="Two-Factor Authentication" value="Not enabled" action="Enable" />
        <SettingRow label="Last login" value={format(new Date(), 'MMMM d, yyyy h:mm a')} />
      </SettingSection>

      <SettingSection title="Sessions" description="Manage your active sessions">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Session</p>
              <p className="text-xs text-gray-500 mt-0.5">Windows · Chrome · San Francisco, CA</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Active now
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Previous Session</p>
              <p className="text-xs text-gray-500 mt-0.5">Mac · Safari · Los Angeles, CA</p>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              2 days ago
            </span>
          </div>
        </div>
        <div className="mt-4">
          <button className="text-sm text-red-600 hover:text-red-800 font-medium">
            Sign out all devices
          </button>
        </div>
      </SettingSection>

      <SettingSection title="API Keys" description="Manage your API access">
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{key.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{key.key}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {format(key.created, 'MMM d, yyyy')} · Last used {format(key.lastUsed, 'MMM d')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Regenerate
                </button>
                <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => setShowApiModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create new API key
          </button>
        </div>
      </SettingSection>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your workspace settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && <PasswordModal />}
      {showInviteModal && <InviteModal />}
      {showApiModal && <ApiKeyModal />}
    </DashboardLayout>
  );
}