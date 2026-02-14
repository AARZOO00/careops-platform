'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  UserPlusIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/useToast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff';
  status: 'active' | 'invited' | 'inactive';
  avatar?: string;
  lastActive?: Date;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: ('Admin' | 'Manager' | 'Staff')[];
}

const demoTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@careops.com',
    role: 'Admin',
    status: 'active',
    lastActive: new Date(),
    permissions: ['all']
  },
  {
    id: '2',
    name: 'Maria Chen',
    email: 'maria@careops.com',
    role: 'Manager',
    status: 'active',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    permissions: ['bookings', 'inventory', 'reports']
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena@careops.com',
    role: 'Staff',
    status: 'invited',
    lastActive: undefined,
    permissions: ['bookings']
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@careops.com',
    role: 'Staff',
    status: 'inactive',
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    permissions: ['bookings', 'forms']
  }
];

const permissionsData: Permission[] = [
  {
    id: 'all',
    name: 'Full Access',
    description: 'Complete system access with no restrictions',
    roles: ['Admin']
  },
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'Create, edit, and cancel bookings',
    roles: ['Admin', 'Manager', 'Staff']
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Manage inventory and stock levels',
    roles: ['Admin', 'Manager']
  },
  {
    id: 'forms',
    name: 'Forms',
    description: 'Create and manage forms',
    roles: ['Admin', 'Manager']
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'View and export reports',
    roles: ['Admin', 'Manager']
  },
  {
    id: 'team',
    name: 'Team Management',
    description: 'Invite and manage team members',
    roles: ['Admin']
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Manage subscription and payments',
    roles: ['Admin']
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Configure third-party integrations',
    roles: ['Admin']
  }
];

export default function TeamTab() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(demoTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = searchTerm === '' ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInvite = async (data: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'invited',
      permissions: data.role === 'Admin' ? ['all'] : ['bookings']
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setShowInviteModal(false);
    setIsLoading(false);
    showToast('success', `Invitation sent to ${data.email}`);
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    setTeamMembers(members =>
      members.map(m =>
        m.id === memberId
          ? {
              ...m,
              role: newRole,
              permissions: newRole === 'Admin' ? ['all'] : m.permissions.filter(p => p !== 'all')
            }
          : m
      )
    );
    showToast('success', 'Role updated successfully');
  };

  const handleStatusToggle = (memberId: string) => {
    setTeamMembers(members =>
      members.map(m =>
        m.id === memberId
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' as const }
          : m
      )
    );
    showToast('success', 'Member status updated');
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(members => members.filter(m => m.id !== memberId));
    showToast('success', 'Team member removed');
  };

  const handleResendInvite = (memberId: string) => {
    showToast('success', 'Invitation resent');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
      case 'invited':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Invited</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Inactive</span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Admin</span>;
      case 'Manager':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Manager</span>;
      case 'Staff':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Staff</span>;
      default:
        return null;
    }
  };

  // Invite Modal
  const InviteModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowInviteModal(false)} />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
                  <UserPlusIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleInvite({
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add a personal message..."
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin w-4 h-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Permissions Modal
  const PermissionsModal = ({ memberId }: { memberId: string }) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return null;

    const availablePermissions = permissionsData.filter(p => 
      p.roles.includes(member.role)
    );

    const handlePermissionToggle = (permissionId: string) => {
      setTeamMembers(members =>
        members.map(m =>
          m.id === memberId
            ? {
                ...m,
                permissions: m.permissions.includes(permissionId)
                  ? m.permissions.filter(p => p !== permissionId)
                  : [...m.permissions, permissionId]
              }
            : m
        )
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPermissionsModal(null)} />
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          >
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
                    <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Permissions for {member.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{member.role} · {member.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPermissionsModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                        {permission.id === 'all' && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            Full Access
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={member.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        disabled={member.role === 'Admin' && permission.id === 'all'}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPermissionsModal(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your team and their permissions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Invite Member
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-2xl font-bold text-indigo-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  {member.status === 'active' && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      {member.email}
                    </div>
                    {member.lastActive && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Last active: {member.lastActive.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <button
                  onClick={() => setShowPermissionsModal(member.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                </button>

                {member.status === 'invited' ? (
                  <>
                    <button
                      onClick={() => handleResendInvite(member.id)}
                      className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Resend
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStatusToggle(member.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        member.status === 'active'
                          ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                          : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Permissions Summary */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Permissions:</span>
                <div className="flex flex-wrap gap-2">
                  {member.permissions.length > 0 ? (
                    member.permissions.map(permId => {
                      const perm = permissionsData.find(p => p.id === permId);
                      return perm ? (
                        <span
                          key={perm.id}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                        >
                          {perm.name}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-xs text-gray-400">No specific permissions</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <UsersIcon className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No team members found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showInviteModal && <InviteModal />}
        {showPermissionsModal && <PermissionsModal memberId={showPermissionsModal} />}
      </AnimatePresence>
    </div>
  );
}