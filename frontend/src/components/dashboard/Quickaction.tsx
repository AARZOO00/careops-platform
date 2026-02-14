'use client';

import { useRouter } from 'next/navigation';
import {
  ChatBubbleLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  CubeIcon,
  UserGroupIcon,
  PlusCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import ComposeMessage from '@/components/inbox/ComposeMessage';
import { cn } from '@/lib/utils';


interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red';
  permissions?: string[];
}

export default function QuickActions() {
  const router = useRouter();
  const [showCompose, setShowCompose] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'new-message',
      name: 'New Message',
      description: 'Send email or SMS to customer',
      icon: ChatBubbleLeftIcon,
      action: () => setShowCompose(true),
      color: 'blue'
    },
    {
      id: 'new-booking',
      name: 'Create Booking',
      description: 'Schedule appointment for customer',
      href: '/bookings/new',
      icon: CalendarIcon,
      color: 'green'
    },
    {
      id: 'send-form',
      name: 'Send Form',
      description: 'Request information from customer',
      href: '/forms/send',
      icon: DocumentTextIcon,
      color: 'purple'
    },
    {
      id: 'add-inventory',
      name: 'Add Inventory',
      description: 'Track new supplies or products',
      href: '/inventory/new',
      icon: CubeIcon,
      color: 'orange'
    },
    {
      id: 'invite-team',
      name: 'Invite Team',
      description: 'Add staff members',
      href: '/settings/team/invite',
      icon: UserGroupIcon,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          hover: 'hover:bg-blue-200'
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          hover: 'hover:bg-green-200'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          hover: 'hover:bg-purple-200'
        };
      case 'orange':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-600',
          hover: 'hover:bg-orange-200'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          hover: 'hover:bg-yellow-200'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          hover: 'hover:bg-red-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          hover: 'hover:bg-gray-200'
        };
    }
  };

  const handleAction = (action: QuickAction) => {
    if (action.action) {
      action.action();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-500">Frequently used tasks</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);

            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="group relative p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                <div className={cn(
                  'inline-flex p-3 rounded-lg transition-colors',
                  colors.bg,
                  colors.hover
                )}>
                  <Icon className={cn('h-5 w-5', colors.text)} />
                </div>
                
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {action.description}
                  </p>
                </div>

                {/* Quick action hint */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-400">Click to start</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Communication channels quick tips */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-xs text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                Email
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                SMS
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <ArrowPathIcon className="h-4 w-4 mr-1 text-gray-400" />
                Automation ready
              </div>
            </div>
            
            <button
              onClick={() => router.push('/settings/integrations')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Configure channels →
            </button>
          </div>
        </div>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <ComposeMessage
          onClose={() => setShowCompose(false)}
          onSuccess={(conversationId) => {
            setShowCompose(false);
            router.push(`/inbox?conversation=${conversationId}`);
          }}
        />
      )}
    </>
  );
}