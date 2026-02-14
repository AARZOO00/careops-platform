'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import {
  ChatBubbleLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'booking' | 'message' | 'form_submission' | 'inventory' | 'system';
  action: string;
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  direction?: string;
  automated?: boolean;
  url?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bookings' | 'messages' | 'forms'>('all');
  const { token } = useAuthStore();

  useEffect(() => {
    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/dashboard/activity/recent', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'bookings') return activity.type === 'booking';
    if (filter === 'messages') return activity.type === 'message';
    if (filter === 'forms') return activity.type === 'form_submission';
    return true;
  });

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'booking':
        return <CalendarIcon className="h-5 w-5 text-blue-600" />;
      case 'message':
        return activity.direction === 'inbound' 
          ? <EnvelopeIcon className="h-5 w-5 text-green-600" />
          : <ChatBubbleLeftIcon className="h-5 w-5 text-purple-600" />;
      case 'form_submission':
        return <DocumentTextIcon className="h-5 w-5 text-orange-600" />;
      case 'inventory':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityIconBackground = (activity: Activity) => {
    switch (activity.type) {
      case 'booking':
        return 'bg-blue-100';
      case 'message':
        return activity.direction === 'inbound' ? 'bg-green-100' : 'bg-purple-100';
      case 'form_submission':
        return 'bg-orange-100';
      case 'inventory':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('bookings')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            filter === 'bookings'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          Bookings
        </button>
        <button
          onClick={() => setFilter('messages')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            filter === 'messages'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          Messages
        </button>
        <button
          onClick={() => setFilter('forms')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            filter === 'forms'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          Forms
        </button>
      </div>

      {/* Activity list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">
              New activities will appear here
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex space-x-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
              onClick={() => activity.url && window.open(activity.url, '_self')}
            >
              {/* Icon */}
              <div className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                getActivityIconBackground(activity)
              )}>
                {getActivityIcon(activity)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                  {activity.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center mt-2 space-x-2">
                  {activity.type === 'message' && activity.automated && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
                      Automated
                    </span>
                  )}
                  {activity.type === 'booking' && activity.status && (
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      activity.status === 'confirmed' && 'bg-green-100 text-green-700',
                      activity.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                      activity.status === 'cancelled' && 'bg-red-100 text-red-700',
                      activity.status === 'completed' && 'bg-blue-100 text-blue-700'
                    )}>
                      {activity.status}
                    </span>
                  )}
                  {activity.user && (
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <UserCircleIcon className="h-3 w-3 mr-1" />
                      {activity.user.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View all link */}
      {filteredActivities.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/inbox'}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}