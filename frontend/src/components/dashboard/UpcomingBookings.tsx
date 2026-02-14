'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  MapPinIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { cn, getStatusColor, getStatusText } from '@/lib/utils';

interface Booking {
  id: string;
  customer_name: string;
  customer_email?: string;
  service_name: string;
  service_duration?: number;
  start_time: string;
  end_time: string;
  status: string;
  confirmation_sent: boolean;
  reminder_sent: boolean;
}

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchBookings();
    // Refresh every minute
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/dashboard/bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 5 }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await axios.post(`/api/bookings/${bookingId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBookings();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      setActionLoading(bookingId);
      await axios.post(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getLocationIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('video') || name.includes('virtual') || name.includes('online')) {
      return <VideoCameraIcon className="h-3 w-3 mr-1" />;
    }
    return <MapPinIcon className="h-3 w-3 mr-1" />;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <CalendarIcon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-2 text-sm text-gray-500">No upcoming bookings</p>
        <p className="text-xs text-gray-400 mt-1">
          New bookings will appear here
        </p>
        <button
          onClick={() => router.push('/bookings')}
          className="mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          View all bookings →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const isToday = startTime.toDateString() === new Date().toDateString();
        const isTomorrow = startTime.toDateString() === new Date(Date.now() + 86400000).toDateString();
        const isPending = booking.status === 'pending';

        return (
          <div
            key={booking.id}
            className={cn(
              'flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50',
              isPending ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200'
            )}
            onClick={() => router.push(`/bookings/${booking.id}`)}
          >
            {/* Time indicator */}
            <div className="flex-shrink-0 w-16 text-center">
              <p className={cn(
                'text-sm font-medium',
                isToday ? 'text-primary-600' : 'text-gray-900'
              )}>
                {format(startTime, 'h:mm a')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : format(startTime, 'MMM d')}
              </p>
            </div>

            {/* Booking details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {booking.customer_name}
                  </p>
                </div>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  getStatusColor(booking.status)
                )}>
                  {getStatusText(booking.status)}
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-1 truncate">
                {booking.service_name}
              </p>

              <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {booking.service_duration} min
                </span>
                <span className="flex items-center">
                  {getLocationIcon(booking.service_name)}
                  {booking.service_name.includes('Virtual') ? 'Virtual' : 'In-person'}
                </span>
                {booking.customer_email && (
                  <span className="flex items-center truncate max-w-[150px]">
                    <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400 " />
                    {booking.customer_email}
                  </span>
                )}
              </div>

              {/* Action buttons for pending bookings */}
              {isPending && (
                <div className="flex items-center mt-3 space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(booking.id);
                    }}
                    disabled={actionLoading === booking.id}
                    className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 disabled:opacity-50"
                  >
                    {actionLoading === booking.id ? (
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                    )}
                    Confirm
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(booking.id);
                    }}
                    disabled={actionLoading === booking.id}
                    className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    Cancel
                  </button>
                </div>
              )}

              {/* Notification status */}
              <div className="flex items-center mt-2 space-x-2">
                {booking.confirmation_sent && (
                  <span className="inline-flex items-center text-xs text-green-600">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Confirmation sent
                  </span>
                )}
                {booking.reminder_sent && (
                  <span className="inline-flex items-center text-xs text-blue-600">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Reminder sent
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* View all link */}
      {bookings.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => router.push('/bookings')}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            View all bookings →
          </button>
        </div>
      )}
    </div>
  );
}