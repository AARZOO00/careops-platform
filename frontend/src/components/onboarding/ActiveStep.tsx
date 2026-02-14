'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { 
  CheckCircleIcon, 
  RocketLaunchIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface ActivateStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ActivateStep({ onComplete, onBack }: ActivateStepProps) {
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [workspace, setWorkspace] = useState<any>(null);
  const { token } = useAuthStore();

  const handleActivate = async () => {
    try {
      setActivating(true);
      const response = await axios.post('/api/onboarding/activate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWorkspace(response.data.workspace);
      setActivated(true);
      toast.success('Your workspace is now live!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to activate workspace');
    } finally {
      setActivating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (activated && workspace) {
    return (
      <div className="space-y-8 text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎉 Your Workspace is Live!</h2>
          <p className="mt-2 text-gray-600">
            Congratulations! Your operations platform is now active and ready to accept bookings.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <RocketLaunchIcon className="h-5 w-5 text-primary-600 mr-2" />
            Your Public Links
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Booking Page</label>
              <div className="flex items-center">
                <code className="flex-1 bg-white px-3 py-2 rounded-l-md border border-r-0 border-gray-300 text-sm">
                  {window.location.origin}{workspace.booking_url}
                </code>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}${workspace.booking_url}`)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                  <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                </button>
                <a
                  href={workspace.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-500" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact Form</label>
              <div className="flex items-center">
                <code className="flex-1 bg-white px-3 py-2 rounded-l-md border border-r-0 border-gray-300 text-sm">
                  {window.location.origin}{workspace.contact_url}
                </code>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}${workspace.contact_url}`)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                  <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                </button>
                <a
                  href={workspace.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-500" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Setup Checklist</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Workspace configured
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Communication channels active
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Services available for booking
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Public pages are live
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center">
      <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
        <RocketLaunchIcon className="h-10 w-10 text-primary-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ready to Launch?</h2>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          You've completed all the setup steps. Activate your workspace to start accepting bookings and managing operations.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 text-left">
        <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Before you activate, verify:
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            At least one communication channel (email/SMS) is configured
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            At least one service with availability is set up
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Your business information is complete
          </li>
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleActivate}
          disabled={activating}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activating ? (
            <>
              <span className="inline-block h-4 w-4 border-t-2 border-white rounded-full animate-spin mr-2"></span>
              Activating...
            </>
          ) : (
            <>
              <RocketLaunchIcon className="h-4 w-4 mr-2" />
              Activate Workspace
            </>
          )}
        </button>
      </div>
    </div>
  );
}