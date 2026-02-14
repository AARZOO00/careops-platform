'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CubeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import WorkspaceStep from '@/components/onboarding/WorkspaceStep';
import CommunicationStep from '@/components/onboarding/CommunicationStep';
import ServicesStep from '@/components/onboarding/ServicesStep';
import InventoryStep from '@/components/onboarding/InventoryStep';
import FormsStep from '@/components/onboarding/FormsStep';
import TeamStep from '@/components/onboarding/TeamStep';
import ActivateStep from '@/components/onboarding/ActivateStep';

const steps = [
  { id: 1, name: 'Workspace', icon: BuildingOfficeIcon, description: 'Business information' },
  { id: 2, name: 'Communication', icon: EnvelopeIcon, description: 'Email & SMS setup' },
  { id: 3, name: 'Services', icon: CalendarIcon, description: 'Booking services' },
  { id: 4, name: 'Inventory', icon: CubeIcon, description: 'Track resources' },
  { id: 5, name: 'Forms', icon: DocumentTextIcon, description: 'Required forms' },
  { id: 6, name: 'Team', icon: UserGroupIcon, description: 'Invite staff' },
  { id: 7, name: 'Activate', icon: CheckCircleIcon, description: 'Go live' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/onboarding/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(response.data);
      setCurrentStep(response.data.current_step || 1);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      toast.error('Failed to load onboarding status');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Set up your workspace
              </h1>
              <p className="text-gray-600 mt-1">
                Complete the steps below to activate your operations platform
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute top-5 w-full h-1 bg-gray-200 rounded-full" />
              <div 
                className="absolute top-5 h-1 bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full
                        ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary-600' : 'bg-gray-200'}
                        text-white transition-all duration-200
                      `}>
                        {isCompleted ? (
                          <CheckCircleSolid className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`
                        mt-2 text-xs font-medium hidden sm:block
                        ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                      `}>
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
          {currentStep === 1 && (
            <WorkspaceStep 
              onNext={handleNext} 
              initialData={status?.steps?.[1]?.completed ? status?.workspace : null}
            />
          )}
          {currentStep === 2 && (
            <CommunicationStep 
              onNext={handleNext} 
              onBack={handleBack}
              initialData={status?.steps?.[2]?.completed ? status?.integrations : null}
            />
          )}
          {currentStep === 3 && (
            <ServicesStep 
              onNext={handleNext} 
              onBack={handleBack}
              initialData={status?.steps?.[3]?.completed ? status?.services : null}
            />
          )}
          {currentStep === 4 && (
            <InventoryStep 
              onNext={handleNext} 
              onBack={handleBack}
              initialData={status?.steps?.[4]?.completed ? status?.inventory : null}
            />
          )}
          {currentStep === 5 && (
            <FormsStep 
              onNext={handleNext} 
              onBack={handleBack}
              initialData={status?.steps?.[5]?.completed ? status?.forms : null}
            />
          )}
          {currentStep === 6 && (
            <TeamStep 
              onNext={handleNext} 
              onBack={handleBack}
              initialData={status?.steps?.[6]?.completed ? status?.staff : null}
            />
          )}
          {currentStep === 7 && (
            <ActivateStep 
              onComplete={() => router.push('/dashboard')}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Navigation buttons for steps without their own navigation */}
        {![1, 2, 3, 4, 5, 6, 7].includes(currentStep) && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Continue
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}