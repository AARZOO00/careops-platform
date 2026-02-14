'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { cn, getInitials, getStatusColor } from '@/lib/utils';

interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  subject: string;
  status: string;
  message_count: number;
  awaiting_reply: boolean;
  last_message?: {
    content: string;
    direction: string;
    created_at: string;
  };
  assigned_to?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect,
  loading 
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'mine' | 'unassigned'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuthStore();

  const filteredConversations = conversations.filter(conv => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      conv.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status filters
    switch (filter) {
      case 'unanswered':
        return conv.awaiting_reply;
      case 'mine':
        return conv.assigned_to?.id === user?.id;
      case 'unassigned':
        return !conv.assigned_to;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors relative',
                filter === 'unanswered'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              Unanswered
              {conversations.filter(c => c.awaiting_reply).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  {conversations.filter(c => c.awaiting_reply).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <FunnelIcon className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {filteredConversations.length} conversations
          </span>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-2 space-y-2 border-t border-gray-200">
            <button
              onClick={() => setFilter('mine')}
              className={cn(
                'w-full text-left px-3 py-2 text-xs rounded-md transition-colors',
                filter === 'mine'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              Assigned to me
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={cn(
                'w-full text-left px-3 py-2 text-xs rounded-md transition-colors',
                filter === 'unassigned'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              Unassigned
            </button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No conversations found</h3>
            <p className="mt-1 text-xs text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : 'Start a new conversation to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  'w-full text-left p-4 hover:bg-gray-50 transition-colors relative',
                  selectedId === conversation.id && 'bg-primary-50 hover:bg-primary-50',
                  conversation.awaiting_reply && 'bg-yellow-50/30 hover:bg-yellow-50/50'
                )}
              >
                {/* Unread indicator */}
                {conversation.awaiting_reply && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-r-full" />
                )}

                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {conversation.contact ? (
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                        conversation.contact.name 
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600'
                      )}>
                        {getInitials(conversation.contact.name || 'Unknown')}
                      </div>
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        selectedId === conversation.id ? 'text-primary-700' : 'text-gray-900'
                      )}>
                        {conversation.contact?.name || 'Unknown Customer'}
                      </p>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatDistance(new Date(conversation.last_message.created_at), new Date(), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center space-x-2 mb-1">
                      {conversation.contact?.email && (
                        <div className="flex items-center text-xs text-gray-500">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[120px]">{conversation.contact.email}</span>
                        </div>
                      )}
                      {conversation.contact?.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[100px]">{conversation.contact.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject and last message */}
                    <p className="text-xs font-medium text-gray-700 mb-0.5 truncate">
                      {conversation.subject || 'No subject'}
                    </p>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.last_message.direction === 'outbound' && 'You: '}
                        {conversation.last_message.content}
                      </p>
                    )}

                    {/* Status indicators */}
                    <div className="flex items-center mt-2 space-x-2">
                      {conversation.awaiting_reply && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                          Awaiting reply
                        </span>
                      )}
                      {conversation.assigned_to && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          <UserCircleIcon className="h-3 w-3 mr-1" />
                          {conversation.assigned_to.name}
                        </span>
                      )}
                      {conversation.message_count > 1 && (
                        <span className="text-xs text-gray-400">
                          {conversation.message_count} messages
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}