'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface FormsStepProps {
  onNext: () => void;
  onBack: () => void;
  initialData?: any;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormData {
  name: string;
  description: string;
  form_type: string;
  fields: FormField[];
}

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'file', label: 'File Upload' }
];

const FORM_TYPES = [
  { value: 'intake', label: 'Intake Form' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'consent', label: 'Consent Form' },
  { value: 'feedback', label: 'Feedback Form' },
  { value: 'custom', label: 'Custom Form' }
];

export default function FormsStep({ onNext, onBack, initialData }: FormsStepProps) {
  const [forms, setForms] = useState(initialData?.forms || []);
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      form_type: 'intake',
      fields: [
        {
          id: 'full_name',
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'your@email.com'
        }
      ]
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'fields'
  });

  const { token } = useAuthStore();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post('/api/onboarding/step5/forms', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (editingForm) {
        setForms(forms.map((f: Form) => f.id === editingForm.id ? response.data.form : f));
        toast.success('Form updated!');
      } else {
        setForms([...forms, response.data.form]);
        toast.success('Form created!');
      }


      
      reset();
      setShowForm(false);
      setEditingForm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create form');
    }
  };
  interface Form {
        id: string;
        name: string;
        description?: string; 
        form_type: string;
        fields: any[]; 
   }

  const handleEdit = (form: any) => {
    setEditingForm(form);
    setValue('name', form.name);
    setValue('description', form.description || '');
    setValue('form_type', form.form_type);
    setValue('fields', form.fields);
    setShowForm(true);
  };

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      await axios.delete(`/api/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(forms.filter((f: Form) => f.id !== formId));
      toast.success('Form deleted');
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const addField = () => {
    append({
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: ''
    });
  };

  const handleSkip = () => {
    toast.success('You can create forms later from the dashboard');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <DocumentTextIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Forms & Documents</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create forms for customers to complete before appointments. This step is optional.
        </p>
      </div>

      {/* Forms List */}
      {forms.length > 0 && (
        <div className="space-y-3">
          {forms.map((form: any) => (
            <div key={form.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="font-medium text-gray-900">{form.name}</p>
                  <span className="ml-2 badge-info text-xs">{form.form_type}</span>
                  {form.require_before_booking && (
                    <span className="ml-2 badge-warning text-xs">Required</span>
                  )}
                </div>
                {form.description && (
                  <p className="mt-1 text-xs text-gray-500">{form.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {form.fields?.length || 0} fields
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(form)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">
            {editingForm ? 'Edit Form' : 'Create New Form'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                  Form Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: 'Form name is required' })}
                  type="text"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., Intake Form"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="form_type" className="block text-xs font-medium text-gray-700">
                  Form Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('form_type', { required: 'Form type is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {FORM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Describe what this form is for..."
              />
            </div>

            {/* Form Fields */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-medium text-gray-700">
                  Form Fields
                </label>
                <button
                  type="button"
                  onClick={addField}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Field
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <input
                            {...register(`fields.${index}.label`)}
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-xs"
                            placeholder="Field Label"
                          />
                        </div>
                        <div>
                          <select
                            {...register(`fields.${index}.type`)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-xs"
                          >
                            {FIELD_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center">
                            <input
                              {...register(`fields.${index}.required`)}
                              type="checkbox"
                              className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-1 text-xs text-gray-600">Required</span>
                          </label>
                          <div className="flex space-x-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => move(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              <ArrowUpIcon className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(index, index + 1)}
                              disabled={index === fields.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              <ArrowDownIcon className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {watch(`fields.${index}.type`) === 'select' && (
                      <div className="mt-2">
                        <input
                          {...register(`fields.${index}.placeholder`)}
                          type="text"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-xs"
                          placeholder="Options (comma separated)"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingForm(null);
                reset();
              }}
              className="px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingForm ? 'Update Form' : 'Create Form'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Form
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