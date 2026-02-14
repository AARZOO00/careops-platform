'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { CubeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface InventoryStepProps {
  onNext: () => void;
  onBack: () => void;
  initialData?: any;
}

interface InventoryForm {
  name: string;
  sku?: string;
  quantity: number;
  threshold: number;
  unit: string;
  description?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  threshold: number;
  unit: string;
  description?: string;
  is_low_stock?: boolean;
  low_stock_alert_sent?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface InventoryResponse {
  status: string;
  item: InventoryItem;
}

const UNITS = [
  'pieces',
  'units',
  'kg',
  'g',
  'lbs',
  'oz',
  'liters',
  'ml',
  'boxes',
  'packs',
  'sets'
];

export default function InventoryStep({ onNext, onBack, initialData }: InventoryStepProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialData?.inventory || []);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<InventoryForm>({
    defaultValues: {
      name: '',
      sku: '',
      quantity: 10,
      threshold: 5,
      unit: 'pieces',
      description: ''
    }
  });

  const { token } = useAuthStore();

  const onSubmit = async (data: InventoryForm) => {
    try {
      const response = await axios.post<InventoryResponse>('/api/onboarding/step4/inventory', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (editingItem) {
        setInventory(inventory.map((item: InventoryItem) => 
          item.id === editingItem.id ? response.data.item : item
        ));
        toast.success('Inventory item updated!');
      } else {
        setInventory([...inventory, response.data.item]);
        toast.success('Inventory item added!');
      }
      
      reset();
      setShowForm(false);
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save inventory item');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('sku', item.sku || '');
    setValue('quantity', item.quantity);
    setValue('threshold', item.threshold);
    setValue('unit', item.unit);
    setValue('description', item.description || '');
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      await axios.delete(`/api/inventory/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(inventory.filter((item: InventoryItem) => item.id !== itemId));
      toast.success('Inventory item deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const handleSkip = () => {
    toast.success('You can add inventory items later from the dashboard');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <CubeIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Inventory Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Track your resources and get alerts when stock runs low. This step is optional.
        </p>
      </div>

      {/* Inventory List */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Your Inventory Items</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {inventory.map((item: InventoryItem) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    {item.sku && (
                      <span className="ml-2 text-xs text-gray-500">SKU: {item.sku}</span>
                    )}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span className="mr-3">Stock: {item.quantity} {item.unit}</span>
                    <span>Threshold: {item.threshold} {item.unit}</span>
                    {item.is_low_stock && (
                      <span className="ml-3 badge-warning">Low Stock</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">
            {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { required: 'Item name is required' })}
                type="text"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="e.g., Printer Paper"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="sku" className="block text-xs font-medium text-gray-700">
                SKU (Optional)
              </label>
              <input
                {...register('sku')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-xs font-medium text-gray-700">
                Initial Quantity <span className="text-red-500">*</span>
              </label>
              <input
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be 0 or more' }
                })}
                type="number"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.quantity ? 'border-red-300' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="threshold" className="block text-xs font-medium text-gray-700">
                Low Stock Threshold <span className="text-red-500">*</span>
              </label>
              <input
                {...register('threshold', { 
                  required: 'Threshold is required',
                  min: { value: 1, message: 'Threshold must be at least 1' }
                })}
                type="number"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.threshold ? 'border-red-300' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-xs font-medium text-gray-700">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                {...register('unit', { required: 'Unit is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {UNITS.map((unit: string) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-xs font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Additional details about this item..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingItem(null);
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Inventory Item
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