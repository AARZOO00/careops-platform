'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface WorkspaceStepProps {
  onNext: () => void;
  initialData?: any;
}

interface WorkspaceForm {
  business_name: string;
  address: string;
  timezone: string;
  contact_email: string;
  contact_phone?: string;
}

export default function WorkspaceStep({ onNext, initialData }: WorkspaceStepProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WorkspaceForm>({
    defaultValues: initialData || {
      business_name: '',
      address: '',
      timezone: 'America/New_York',
      contact_email: '',
      contact_phone: ''
    }
  });
  
  const { token } = useAuthStore();

  const onSubmit = async (data: WorkspaceForm) => {
    try {
      await axios.post('/api/onboarding/step1/workspace', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Workspace configured successfully!');
      onNext();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to configure workspace');
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'America/Puerto_Rico', label: 'Atlantic Time (AST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
    { value: 'Asia/Tokyo', label: 'Japan Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Business Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your business. This information will be used for customer communications.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
            Business Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              {...register('business_name', { 
                required: 'Business name is required',
                minLength: {
                  value: 2,
                  message: 'Business name must be at least 2 characters'
                }
              })}
              type="text"
              className={`input-field ${errors.business_name ? 'input-error' : ''}`}
              placeholder="Acme Inc."
            />
            {errors.business_name && (
              <p className="error-text">{errors.business_name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Business Address <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              {...register('address', { 
                required: 'Address is required',
                minLength: {
                  value: 5,
                  message: 'Please enter a valid address'
                }
              })}
              type="text"
              className={`input-field ${errors.address ? 'input-error' : ''}`}
              placeholder="123 Main St, City, State 12345"
            />
            {errors.address && (
              <p className="error-text">{errors.address.message}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Required for in-person services and calendar integrations
          </p>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Time Zone <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              {...register('timezone', { required: 'Time zone is required' })}
              className={`input-field ${errors.timezone ? 'input-error' : ''}`}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="error-text">{errors.timezone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              {...register('contact_email', { 
                required: 'Contact email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className={`input-field ${errors.contact_email ? 'input-error' : ''}`}
              placeholder="hello@acme.com"
            />
            {errors.contact_email && (
              <p className="error-text">{errors.contact_email.message}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Customers will use this email to contact you
          </p>
        </div>

        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
            Contact Phone (Optional)
          </label>
          <div className="mt-1">
            <input
              {...register('contact_phone')}
              type="tel"
              className="input-field"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Used for SMS notifications and customer support
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 border-t-2 border-white rounded-full animate-spin mr-2"></span>
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
}