'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  XCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Demo data
const DEMO_INVENTORY = [
  {
    id: '1',
    name: 'Printer Paper',
    sku: 'PAP-001',
    category: 'Office Supplies',
    quantity: 2,
    threshold: 5,
    unit: 'reams',
    price: 12.99,
    location: 'Cabinet A3',
    supplier: 'Office Depot',
    lastRestocked: new Date(Date.now() - 7 * 86400000).toISOString(),
    description: 'A4 copy paper, 500 sheets per ream'
  },
  {
    id: '2',
    name: 'Toner Cartridge',
    sku: 'TN-002',
    category: 'Printer Supplies',
    quantity: 1,
    threshold: 3,
    unit: 'cartridges',
    price: 89.99,
    location: 'Cabinet B1',
    supplier: 'HP Direct',
    lastRestocked: new Date(Date.now() - 14 * 86400000).toISOString(),
    description: 'Black laser toner, high yield'
  },
  {
    id: '3',
    name: 'Staples',
    sku: 'STP-003',
    category: 'Office Supplies',
    quantity: 0,
    threshold: 2,
    unit: 'boxes',
    price: 4.99,
    location: 'Cabinet A2',
    supplier: 'Staples',
    lastRestocked: new Date(Date.now() - 30 * 86400000).toISOString(),
    description: 'Standard size, 5000 staples per box'
  },
  {
    id: '4',
    name: 'Pens (Black)',
    sku: 'PEN-004',
    category: 'Office Supplies',
    quantity: 15,
    threshold: 10,
    unit: 'boxes',
    price: 8.99,
    location: 'Cabinet A1',
    supplier: 'Office Depot',
    lastRestocked: new Date(Date.now() - 5 * 86400000).toISOString(),
    description: 'Ballpoint pens, 12 per box'
  },
  {
    id: '5',
    name: 'Post-it Notes',
    sku: 'PIN-005',
    category: 'Office Supplies',
    quantity: 8,
    threshold: 5,
    unit: 'pads',
    price: 3.99,
    location: 'Cabinet A4',
    supplier: '3M',
    lastRestocked: new Date(Date.now() - 10 * 86400000).toISOString(),
    description: '3x3 inches, yellow'
  },
  {
    id: '6',
    name: 'Binder Clips',
    sku: 'BC-006',
    category: 'Office Supplies',
    quantity: 4,
    threshold: 3,
    unit: 'boxes',
    price: 6.99,
    location: 'Cabinet A2',
    supplier: 'Amazon',
    lastRestocked: new Date(Date.now() - 12 * 86400000).toISOString(),
    description: 'Assorted sizes, 100 per box'
  }
];

const CATEGORIES = [
  'Office Supplies',
  'Printer Supplies',
  'Cleaning Supplies',
  'Electronics',
  'Furniture',
  'Other'
];

export default function InventoryClient() {
  const [items, setItems] = useState(DEMO_INVENTORY);
  const [filteredItems, setFilteredItems] = useState(DEMO_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(1);

  useEffect(() => {
    filterItems();
  }, [searchTerm, categoryFilter, stockFilter, items]);

  const filterItems = () => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(i => i.category === categoryFilter);
    }
    
    if (stockFilter === 'low') {
      filtered = filtered.filter(i => i.quantity <= i.threshold && i.quantity > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(i => i.quantity === 0);
    }
    
    setFilteredItems(filtered);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleRestock = (id: string) => {
    setItems(items.map(i => 
      i.id === id 
        ? { ...i, quantity: i.quantity + restockQuantity, lastRestocked: new Date().toISOString() }
        : i
    ));
    setShowRestockModal(null);
    setRestockQuantity(1);
  };

  const handleQuantityChange = (id: string, adjustment: number) => {
    setItems(items.map(i => 
      i.id === id 
        ? { ...i, quantity: Math.max(0, i.quantity + adjustment) }
        : i
    ));
  };

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: ExclamationTriangleIcon };
    }
    if (item.quantity <= item.threshold) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700', icon: ExclamationTriangleIcon };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon };
  };

  const stats = {
    total: items.length,
    totalValue: items.reduce((acc, i) => acc + (i.quantity * i.price), 0),
    lowStock: items.filter(i => i.quantity <= i.threshold && i.quantity > 0).length,
    outOfStock: items.filter(i => i.quantity === 0).length
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => {
        const status = getStockStatus(item);
        const StatusIcon = status.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                  <CubeIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowModal(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-900">{item.quantity}</p>
                  <p className="text-xs text-gray-500">{item.unit}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Threshold</p>
                <p className="text-xl font-bold text-gray-900">{item.threshold}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Stock Level</span>
                <span className="text-gray-900 font-medium">
                  {Math.min(100, Math.round((item.quantity / item.threshold) * 100))}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.quantity === 0 ? 'bg-red-500' :
                    item.quantity <= item.threshold ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (item.quantity / item.threshold) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-xs">
                <span className="text-gray-500">Location:</span>
                <p className="font-medium text-gray-900 mt-0.5">{item.location}</p>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Category:</span>
                <p className="font-medium text-gray-900 mt-0.5">{item.category}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  disabled={item.quantity === 0}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <button
                  onClick={() => setShowRestockModal(item.id)}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <ShoppingBagIcon className="h-3 w-3 mr-1" />
                  Restock
                </button>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const status = getStockStatus(item);
              const StatusIcon = status.icon;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <CubeIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.category}</div>
                    <div className="text-sm text-gray-500">{item.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                      <span className="text-xs text-gray-500">{item.unit}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2">
                      <div 
                        className={`h-full rounded-full ${
                          item.quantity === 0 ? 'bg-red-500' :
                          item.quantity <= item.threshold ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.quantity / item.threshold) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">per {item.unit}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowRestockModal(item.id)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Restock Modal
  const RestockModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRestockModal(null)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <ShoppingBagIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restock Item</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter the quantity to add to inventory
              </p>
              <div className="mt-4">
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-center space-x-3">
            <button
              onClick={() => setShowRestockModal(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRestock(showRestockModal!)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Restock
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Inventory Modal (Add/Edit)
  const InventoryModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Printer Paper"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.sku}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Auto-generated"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    defaultValue={editingItem?.quantity || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                  <input
                    type="number"
                    defaultValue={editingItem?.threshold || 5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.unit || 'pieces'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.price || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.location}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Cabinet A1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  defaultValue={editingItem?.supplier}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Office Depot"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  defaultValue={editingItem?.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional details..."
                />
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
                // In a real app, this would save the item
                setShowModal(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this inventory item? This action cannot be undone.
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
              Delete Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage your stock levels</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                List
              </button>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <CubeIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${stats.totalValue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
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
                placeholder="Search by name, SKU, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Display */}
        {filteredItems.length > 0 ? (
          view === 'grid' ? <GridView /> : <ListView />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <CubeIcon className="h-10 w-10 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No inventory items found</h3>
            <p className="text-gray-500 mt-1">Get started by adding your first item</p>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowModal(true);
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Inventory Item
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && <InventoryModal />}
      {showDeleteConfirm && <DeleteModal />}
      {showRestockModal && <RestockModal />}
    </DashboardLayout>
  );
}