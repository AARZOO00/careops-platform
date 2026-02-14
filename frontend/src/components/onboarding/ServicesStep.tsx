'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { CalendarIcon, PlusIcon, TrashIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface ServicesStepProps {
  onNext: () => void;
  onBack: () => void;
  initialData?: any;
}

interface ServiceForm {
  name: string;
  description: string;
  duration: number;
  price: number;
  location_type: string;
  availability: {
    day: number;
    enabled: boolean;
    slots: string[];
  }[];
}

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export default function ServicesStep({ onNext, onBack, initialData }: ServicesStepProps) {
  const [showForm, setShowForm] = useState(!initialData?.services?.length);
  const [services, setServices] = useState(initialData?.services || []);
  
  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    defaultValues: {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      location_type: 'physical',
      availability: DAYS.map(day => ({
        day: day.id,
        enabled: day.id <= 5,
        slots: day.id <= 5 ? ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'] : []
      }))
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'availability'
  });

  const { token } = useAuthStore();

  const onSubmit = async (data: ServiceForm) => {
    try {
      const response = await axios.post('/api/onboarding/step3/services', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setServices([...services, response.data.service]);
      toast.success('Service added successfully!');
      reset();
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add service');
    }
  };

  const handleContinue = () => {
    if (services.length > 0) {
      onNext();
    } else {
      toast.error('Please add at least one service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <CalendarIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Booking Services</h2>
        <p className="mt-1 text-sm text-gray-500">
          Define the services customers can book. Add at least one service to continue.
        </p>
      </div>

      {/* List of existing services */}
      {services.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Your Services</h3>
          {services.map((service: any) => (
            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {service.duration} min
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {service.location_type}
                  </span>
                  <span>${service.price / 100}</span>
                </div>
              </div>
              <span className="badge-success">Active</span>
            </div>
          ))}
        </div>
      )}

      {/* Add new service form */}
      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { required: 'Service name is required' })}
                type="text"
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g., Consultation, Massage, Meeting"
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input-field"
                placeholder="Describe what this service includes..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('duration', { required: 'Duration is required' })}
                  className={`input-field ${errors.duration ? 'input-error' : ''}`}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className={`input-field ${errors.price ? 'input-error' : ''}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="location_type" className="block text-sm font-medium text-gray-700">
                  Location Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('location_type', { required: 'Location type is required' })}
                  className={`input-field ${errors.location_type ? 'input-error' : ''}`}
                >
                  <option value="physical">Physical Location</option>
                  <option value="virtual">Virtual (Video Call)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Availability <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const day = DAYS.find(d => d.id === field.day);
                  return (
                    <div key={field.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center h-6 pt-1">
                        <input
                          type="checkbox"
                          {...register(`availability.${index}.enabled`)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          {day?.name}
                        </label>
                        {watch(`availability.${index}.enabled`) && (
                          <div className="mt-2">
                            <select
                              {...register(`availability.${index}.slots`)}
                              multiple
                              size={4}
                              className="input-field text-sm"
                            >
                              {TIME_SLOTS.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              Hold Ctrl/Cmd to select multiple time slots
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {services.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Another Service
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
        <button
          type="button"
          onClick={handleContinue}
          disabled={services.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}