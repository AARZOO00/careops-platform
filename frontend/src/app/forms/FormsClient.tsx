'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Demo data
const DEMO_FORMS = [
  {
    id: '1',
    name: 'Client Intake Form',
    description: 'Initial information collection for new clients',
    type: 'intake',
    status: 'active',
    fields: 12,
    submissions: 45,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastModified: new Date(Date.now() - 2 * 86400000).toISOString(),
    requireBeforeBooking: true
  },
  {
    id: '2',
    name: 'Service Agreement',
    description: 'Terms and conditions for services',
    type: 'agreement',
    status: 'active',
    fields: 8,
    submissions: 32,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastModified: new Date(Date.now() - 5 * 86400000).toISOString(),
    requireBeforeBooking: true
  },
  {
    id: '3',
    name: 'Feedback Survey',
    description: 'Post-appointment feedback collection',
    type: 'feedback',
    status: 'active',
    fields: 6,
    submissions: 28,
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    lastModified: new Date(Date.now() - 10 * 86400000).toISOString(),
    requireBeforeBooking: false
  },
  {
    id: '4',
    name: 'Health Questionnaire',
    description: 'Medical history and health information',
    type: 'intake',
    status: 'draft',
    fields: 15,
    submissions: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastModified: new Date(Date.now() - 1 * 86400000).toISOString(),
    requireBeforeBooking: true
  },
  {
    id: '5',
    name: 'Consent Form',
    description: 'Photo release and marketing consent',
    type: 'consent',
    status: 'archived',
    fields: 4,
    submissions: 12,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastModified: new Date(Date.now() - 30 * 86400000).toISOString(),
    requireBeforeBooking: false
  }
];

const FORM_TYPES = [
  { value: 'intake', label: 'Intake Form', color: 'blue' },
  { value: 'agreement', label: 'Agreement', color: 'purple' },
  { value: 'consent', label: 'Consent Form', color: 'green' },
  { value: 'feedback', label: 'Feedback', color: 'yellow' },
  { value: 'custom', label: 'Custom', color: 'gray' }
];

export default function FormsClient() {
  const [forms, setForms] = useState(DEMO_FORMS);
  const [filteredForms, setFilteredForms] = useState(DEMO_FORMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    filterForms();
  }, [searchTerm, typeFilter, statusFilter, forms]);

  const filterForms = () => {
    let filtered = forms;
    
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }
    
    setFilteredForms(filtered);
  };

  const handleDelete = (id: string) => {
    setForms(forms.filter(f => f.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (form: any) => {
    const newForm = {
      ...form,
      id: String(Date.now()),
      name: `${form.name} (Copy)`,
      submissions: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setForms([...forms, newForm]);
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      intake: 'bg-blue-100 text-blue-700',
      agreement: 'bg-purple-100 text-purple-700',
      consent: 'bg-green-100 text-green-700',
      feedback: 'bg-yellow-100 text-yellow-700',
      custom: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const FormPreviewModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreview(null)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {showPreview && (
                <>
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {forms.find(f => f.id === showPreview)?.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {forms.find(f => f.id === showPreview)?.description}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Sample Field {i} {i === 1 && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          placeholder="Sample input"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          disabled
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 text-center">
                      This is a preview. Form fields are not editable in preview mode.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={() => setShowPreview(null)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const FormModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingForm ? 'Edit Form' : 'Create New Form'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                <input
                  type="text"
                  defaultValue={editingForm?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Client Intake Form"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  defaultValue={editingForm?.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description of this form..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {FORM_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireBeforeBooking"
                  defaultChecked={editingForm?.requireBeforeBooking}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requireBeforeBooking" className="ml-2 block text-sm text-gray-900">
                  Require completion before booking
                </label>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In a real app, this would save the form
                setShowModal(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              {editingForm ? 'Update Form' : 'Create Form'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(null)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Form</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this form? This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-center space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm!)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Delete Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Forms
            </h1>
            <p className="text-gray-600 mt-1">Create and manage customer forms</p>
          </div>
          <button
            onClick={() => {
              setEditingForm(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Form
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{forms.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {forms.filter(f => f.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {forms.filter(f => f.status === 'draft').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {forms.reduce((acc, f) => acc + f.submissions, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Types</option>
                {FORM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                      <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{form.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingForm(form);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(form)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(form.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(form.type)}`}>
                    {FORM_TYPES.find(t => t.value === form.type)?.label || form.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(form.status)}`}>
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </span>
                  {form.requireBeforeBooking && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      Required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Fields</p>
                    <p className="text-lg font-bold text-gray-900">{form.fields}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Submissions</p>
                    <p className="text-lg font-bold text-gray-900">{form.submissions}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Updated {format(new Date(form.lastModified), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPreview(form.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No forms found</h3>
            <p className="text-gray-500 mt-1">Get started by creating your first form</p>
            <button
              onClick={() => {
                setEditingForm(null);
                setShowModal(true);
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Form
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && <FormModal />}
      {showDeleteConfirm && <DeleteModal />}
      {showPreview && <FormPreviewModal />}
    </DashboardLayout>
  );
}