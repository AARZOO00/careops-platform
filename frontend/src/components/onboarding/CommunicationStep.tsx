'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { EnvelopeIcon, PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CommunicationStepProps {
  onNext: () => void;
  onBack: () => void;
  initialData?: any;
}

interface CommunicationForm {
  email_provider?: string;
  email_api_key?: string;
  email_from?: string;
  sms_provider?: string;
  sms_account_sid?: string;
  sms_auth_token?: string;
  sms_from_number?: string;
}

export default function CommunicationStep({ onNext, onBack, initialData }: CommunicationStepProps) {
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'both'>(
    initialData?.integrations?.length > 1 ? 'both' : 
    initialData?.integrations?.[0]?.type === 'email' ? 'email' : 
    initialData?.integrations?.[0]?.type === 'sms' ? 'sms' : 'email'
  );
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CommunicationForm>({
    defaultValues: initialData?.integrations?.reduce((acc: any, int: any) => {
      if (int.type === 'email') {
        acc.email_provider = int.provider;
        acc.email_from = int.credentials?.from_email;
      }
      if (int.type === 'sms') {
        acc.sms_provider = int.provider;
        acc.sms_from_number = int.credentials?.from_number;
      }
      return acc;
    }, {}) || {}
  });

  const { token } = useAuthStore();

  const onSubmit = async (data: CommunicationForm) => {
    try {
      const payload: any = {};
      
      if (selectedChannel === 'email' || selectedChannel === 'both') {
        payload.email = {
          provider: data.email_provider || 'sendgrid',
          api_key: data.email_api_key || 'demo_key',
          from_email: data.email_from
        };
      }
      
      if (selectedChannel === 'sms' || selectedChannel === 'both') {
        payload.sms = {
          provider: data.sms_provider || 'twilio',
          account_sid: data.sms_account_sid || 'demo_sid',
          auth_token: data.sms_auth_token || 'demo_token',
          from_number: data.sms_from_number
        };
      }

      await axios.post('/api/onboarding/step2/integrations', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Communication channels configured!');
      onNext();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to configure channels');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <EnvelopeIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Communication Channels</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect at least one channel. Your customers will receive notifications here.
        </p>
      </div>

      {/* Channel Selection */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setSelectedChannel('email')}
          className={`relative rounded-lg border p-4 text-left transition-all ${
            selectedChannel === 'email'
              ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {selectedChannel === 'email' && (
            <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
          )}
          <EnvelopeIcon className={`h-8 w-8 ${
            selectedChannel === 'email' ? 'text-primary-600' : 'text-gray-400'
          }`} />
          <h3 className="mt-2 font-medium text-gray-900">Email Only</h3>
          <p className="mt-1 text-xs text-gray-500">
            Send confirmations, forms, and updates via email
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel('sms')}
          className={`relative rounded-lg border p-4 text-left transition-all ${
            selectedChannel === 'sms'
              ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {selectedChannel === 'sms' && (
            <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
          )}
          <PhoneIcon className={`h-8 w-8 ${
            selectedChannel === 'sms' ? 'text-primary-600' : 'text-gray-400'
          }`} />
          <h3 className="mt-2 font-medium text-gray-900">SMS Only</h3>
          <p className="mt-1 text-xs text-gray-500">
            Send reminders and quick updates via text message
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel('both')}
          className={`relative rounded-lg border p-4 text-left transition-all ${
            selectedChannel === 'both'
              ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {selectedChannel === 'both' && (
            <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
          )}
          <div className="flex space-x-1">
            <EnvelopeIcon className={`h-8 w-8 ${
              selectedChannel === 'both' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <PhoneIcon className={`h-8 w-8 ${
              selectedChannel === 'both' ? 'text-primary-600' : 'text-gray-400'
            }`} />
          </div>
          <h3 className="mt-2 font-medium text-gray-900">Both Channels</h3>
          <p className="mt-1 text-xs text-gray-500">
            Maximum reach with email and SMS combined
          </p>
        </button>
      </div>

      {/* Email Configuration */}
      {(selectedChannel === 'email' || selectedChannel === 'both') && (
        <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center">
            <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Email Configuration</h3>
          </div>
          
          <div>
            <label htmlFor="email_provider" className="block text-sm font-medium text-gray-700">
              Email Provider
            </label>
            <select
              {...register('email_provider')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="smtp">SMTP</option>
              <option value="ses">Amazon SES</option>
              <option value="mailgun">Mailgun</option>
            </select>
          </div>

          <div>
            <label htmlFor="email_api_key" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              {...register('email_api_key')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="••••••••••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your API key will be encrypted and stored securely
            </p>
          </div>

          <div>
            <label htmlFor="email_from" className="block text-sm font-medium text-gray-700">
              From Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email_from', { 
                required: selectedChannel === 'email' || selectedChannel === 'both' ? 'From email is required' : false,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.email_from ? 'border-red-300' : ''
              }`}
              placeholder="hello@yourbusiness.com"
            />
            {errors.email_from && (
              <p className="mt-1 text-xs text-red-600">{errors.email_from.message}</p>
            )}
          </div>
        </div>
      )}

      {/* SMS Configuration */}
      {(selectedChannel === 'sms' || selectedChannel === 'both') && (
        <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center">
            <PhoneIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">SMS Configuration</h3>
          </div>

          <div>
            <label htmlFor="sms_provider" className="block text-sm font-medium text-gray-700">
              SMS Provider
            </label>
            <select
              {...register('sms_provider')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="twilio">Twilio</option>
              <option value="vonage">Vonage</option>
              <option value="messagebird">MessageBird</option>
              <option value="telnyx">Telnyx</option>
            </select>
          </div>

          <div>
            <label htmlFor="sms_account_sid" className="block text-sm font-medium text-gray-700">
              Account SID
            </label>
            <input
              {...register('sms_account_sid')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div>
            <label htmlFor="sms_auth_token" className="block text-sm font-medium text-gray-700">
              Auth Token
            </label>
            <input
              {...register('sms_auth_token')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="••••••••••••••••"
            />
          </div>

          <div>
            <label htmlFor="sms_from_number" className="block text-sm font-medium text-gray-700">
              From Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('sms_from_number', { 
                required: selectedChannel === 'sms' || selectedChannel === 'both' ? 'From number is required' : false,
                pattern: {
                  value: /^\+[1-9]\d{1,14}$/,
                  message: 'Please enter a valid E.164 format number (e.g., +1234567890)'
                }
              })}
              type="tel"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.sms_from_number ? 'border-red-300' : ''
              }`}
              placeholder="+1234567890"
            />
            {errors.sms_from_number && (
              <p className="mt-1 text-xs text-red-600">{errors.sms_from_number.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must be in E.164 format (e.g., +1234567890)
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back
        </button>
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