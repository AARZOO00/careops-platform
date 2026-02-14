'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  VideoCameraIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format, formatDistance, addDays, subDays, isSameDay, startOfWeek, addWeeks, subWeeks } from 'date-fns';

// Demo data
const DEMO_BOOKINGS = [
  {
    id: '1',
    customer: { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1 (555) 123-4567' },
    service: { name: 'Consultation', duration: 60, price: 99 },
    startTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    status: 'confirmed',
    location: 'Virtual Meeting',
    notes: 'First time client, interested in marketing services'
  },
  {
    id: '2',
    customer: { name: 'Michael Chen', email: 'michael.c@example.com', phone: '+1 (555) 234-5678' },
    service: { name: 'Follow-up', duration: 30, price: 49 },
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
    status: 'confirmed',
    location: 'Phone Call',
    notes: 'Project update meeting'
  },
  {
    id: '3',
    customer: { name: 'Emily Rodriguez', email: 'emily.r@example.com', phone: '+1 (555) 345-6789' },
    service: { name: 'Project Kickoff', duration: 90, price: 149 },
    startTime: new Date(addDays(new Date(), 1).setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(addDays(new Date(), 1).setHours(10, 30, 0, 0)).toISOString(),
    status: 'pending',
    location: 'Client Office',
    notes: 'New website project'
  },
  {
    id: '4',
    customer: { name: 'David Kim', email: 'david.k@example.com', phone: '+1 (555) 456-7890' },
    service: { name: 'Consultation', duration: 60, price: 99 },
    startTime: new Date(addDays(new Date(), 2).setHours(11, 0, 0, 0)).toISOString(),
    endTime: new Date(addDays(new Date(), 2).setHours(12, 0, 0, 0)).toISOString(),
    status: 'confirmed',
    location: 'Virtual Meeting',
    notes: 'SEO strategy discussion'
  },
  {
    id: '5',
    customer: { name: 'Lisa Thompson', email: 'lisa.t@example.com', phone: '+1 (555) 567-8901' },
    service: { name: 'Follow-up', duration: 30, price: 49 },
    startTime: new Date(addDays(new Date(), 3).setHours(15, 30, 0, 0)).toISOString(),
    endTime: new Date(addDays(new Date(), 3).setHours(16, 0, 0, 0)).toISOString(),
    status: 'cancelled',
    location: 'Phone Call',
    notes: 'Rescheduled to next week'
  }
];

export default function BookingsClient() {
  const [bookings, setBookings] = useState(DEMO_BOOKINGS);
  const [filteredBookings, setFilteredBookings] = useState(DEMO_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const filterBookings = () => {
    let filtered = bookings;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const handleDelete = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookings(bookings.map(b => 
      b.id === id ? { ...b, status: newStatus } : b
    ));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      pending: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      cancelled: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      completed: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircleIcon;
      case 'pending': return ClockIcon;
      case 'cancelled': return XCircleIcon;
      case 'completed': return CheckCircleIcon;
      default: return ClockIcon;
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(b => isSameDay(new Date(b.startTime), date));
  };

  // Calendar View Component
  const CalendarView = () => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-gray-200">
        {getWeekDays().map((day, idx) => (
          <div
            key={idx}
            className={`p-4 text-center border-b ${
              isSameDay(day, new Date()) ? 'bg-indigo-50' : ''
            }`}
          >
            <p className="text-sm font-medium text-gray-600">
              {format(day, 'EEE')}
            </p>
            <p className={`text-2xl font-bold mt-1 ${
              isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getBookingsForDate(day).length} bookings
            </p>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
          <div key={time} className="grid grid-cols-7 divide-x divide-gray-200 min-h-[80px]">
            {getWeekDays().map((day, idx) => {
              const dayBookings = getBookingsForDate(day).filter(b => 
                format(new Date(b.startTime), 'h:mm a') === time
              );
              return (
                <div key={idx} className="p-2 hover:bg-gray-50 transition-colors relative group">
                  {dayBookings.map((booking, bidx) => (
                    <div
                      key={bidx}
                      onClick={() => {
                        setEditingBooking(booking);
                        setShowModal(true);
                      }}
                      className={`p-2 rounded-lg text-xs text-white mb-1 ${getStatusBadge(booking.status)} cursor-pointer hover:shadow-md transition-all transform hover:scale-[1.02]`}
                    >
                      <p className="font-semibold truncate">{booking.customer.name}</p>
                      <p className="text-xs opacity-90 truncate">{booking.service.name}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditingBooking(null);
                      setShowModal(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-indigo-50 bg-opacity-90 rounded-lg transition-opacity"
                  >
                    <PlusIcon className="h-5 w-5 text-indigo-600" />
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Actions */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {filteredBookings.length} total
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Calendar
              </button>
            </div>
            <button
              onClick={() => {
                setEditingBooking(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, service, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-700">
                            {booking.customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.customer.name}</div>
                          <div className="text-sm text-gray-500">{booking.customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.service.name}</div>
                      <div className="text-sm text-gray-500">{booking.service.duration} min</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(booking.startTime), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadge(booking.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingBooking(booking);
                            setShowModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(booking.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <CalendarIcon className="h-10 w-10 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first booking</p>
          <button
            onClick={() => {
              setEditingBooking(null);
              setShowModal(true);
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Booking
          </button>
        </div>
      )}
    </div>
  );

  // Booking Modal
  const BookingModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBooking ? 'Edit Booking' : 'New Booking'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  defaultValue={editingBooking?.customer.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={editingBooking?.customer.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={editingBooking?.customer.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    defaultValue={editingBooking ? format(new Date(editingBooking.startTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    defaultValue={editingBooking ? format(new Date(editingBooking.startTime), 'HH:mm') : '09:00'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option>Consultation (60 min - $99)</option>
                  <option>Follow-up (30 min - $49)</option>
                  <option>Project Kickoff (90 min - $149)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option>Virtual Meeting</option>
                  <option>Phone Call</option>
                  <option>Client Office</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  defaultValue={editingBooking?.notes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional information..."
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
                // In a real app, this would save the booking
                setShowModal(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              {editingBooking ? 'Update Booking' : 'Create Booking'}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Booking</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this booking? This action cannot be undone.
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
              Delete Booking
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
              Bookings
            </h1>
            <p className="text-gray-600 mt-1">Manage your appointments and schedules</p>
          </div>
        </div>

        {/* Main Content */}
        {view === 'list' ? <ListView /> : <CalendarView />}
      </div>

      {/* Modals */}
      {showModal && <BookingModal />}
      {showDeleteConfirm && <DeleteModal />}
    </DashboardLayout>
  );
}