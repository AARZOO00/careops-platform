'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { UserGroupIcon, PlusIcon, TrashIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface TeamStepProps {
  onNext: () => void;
  onBack: () => void;
  initialData?: any;
}

interface TeamForm {
  email: string;
  full_name: string;
  role: string;
}

export default function TeamStep({ onNext, onBack, initialData }: TeamStepProps) {
  const [team, setTeam] = useState(initialData?.staff || []);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TeamForm>({
    defaultValues: {
      email: '',
      full_name: '',
      role: 'staff'
    }
  });

  const { token } = useAuthStore();

  const onSubmit = async (data: TeamForm) => {
    try {
      const response = await axios.post('/api/onboarding/step6/team', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeam([...team, response.data.user]);
      toast.success(`Invitation sent to ${data.email}`);
      reset();
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to invite team member');
    }
  };

  const handleDelete = async (userId: string) => {
    // Note: You'll need to implement a delete endpoint for this
    setTeam(team.filter((member: any) => member.id !== userId));
    toast.success('Team member removed');
  };

  const handleSkip = () => {
    toast.success('You can invite team members later from the dashboard');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <UserGroupIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Invite Your Team</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add staff members to help manage bookings and customer communication. This step is optional.
        </p>
      </div>

      {/* Team Members List */}
      {team.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Team Members</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {team.map((member: any) => (
              <div key={member.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      {member.email}
                      <span className="ml-2 badge-info text-xs capitalize">{member.role}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Form */}
      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Invite Team Member</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="block text-xs font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('full_name', { required: 'Name is required' })}
                type="text"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.full_name ? 'border-red-300' : ''
                }`}
                placeholder="John Doe"
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : ''
                }`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-medium text-gray-700">
                Role
              </label>
              <select
                {...register('role')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Invite Team Member
        </button>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <div className="space-x-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Skip for Now
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}