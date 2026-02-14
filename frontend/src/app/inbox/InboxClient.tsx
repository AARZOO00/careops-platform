'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  TrashIcon,
  FlagIcon,
  BellAlertIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { formatDistance } from 'date-fns';
import ComposeMessage from '@/components/inbox/ComposeMessage';

export default function InboxClient() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inbox/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-indigo-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-teal-500 to-cyan-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const ConversationList = () => (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Inbox
          </h1>
          <button
            onClick={() => setShowCompose(true)}
            className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center ${
              filter === 'unanswered'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Unanswered
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === 'mine'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mine
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-all relative ${
                  selectedConversation === conv.id ? 'bg-indigo-50' : ''
                }`}
              >
                {conv.awaiting_reply && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-r-full"></div>
                )}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(conv.contact?.name || 'Unknown')} flex items-center justify-center text-white font-bold text-sm`}>
                    {getInitials(conv.contact?.name || 'UN')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conv.contact?.name || 'Unknown'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {conv.last_message && formatDistance(new Date(conv.last_message.created_at), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{conv.contact?.email || conv.contact?.phone}</p>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      {conv.awaiting_reply && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                          Awaiting reply
                        </span>
                      )}
                      {conv.assigned_to && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <UserCircleIcon className="h-3 w-3 mr-1" />
                          {conv.assigned_to.name}
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

  const MessageThread = () => (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor('Sarah Johnson')} flex items-center justify-center text-white font-bold text-lg`}>
              SJ
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sarah Johnson</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="flex items-center text-xs text-gray-500">
                  <EnvelopeIcon className="h-3 w-3 mr-1" />
                  sarah@example.com
                </span>
                <span className="flex items-center text-xs text-gray-500">
                  <PhoneIcon className="h-3 w-3 mr-1" />
                  +1 (555) 123-4567
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <PhoneIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <EnvelopeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Message - Inbound */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            SJ
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">Sarah Johnson</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-800">
                Hi! I'd like to schedule a consultation for next week. Do you have any availability on Tuesday?
              </p>
            </div>
          </div>
        </div>

        {/* Message - Outbound */}
        <div className="flex items-start justify-end space-x-3">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center justify-end space-x-2 mb-1">
              <span className="text-xs text-gray-400">1 hour ago</span>
              <span className="text-sm font-medium text-gray-900">You</span>
            </div>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
              <p className="text-sm text-white">
                Hi Sarah! Yes, we have availability on Tuesday at 2:00 PM and 4:00 PM. Would either work for you?
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>
        </div>

        {/* Message - Automated */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
            <ChatBubbleLeftIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">CareOps Bot</span>
              <span className="text-xs text-gray-400">30 minutes ago</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
              <p className="text-sm text-gray-800">
                📅 Reminder: Your consultation with Sarah Johnson is scheduled for tomorrow at 2:00 PM.
              </p>
              <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                <ClockIcon className="h-3 w-3 mr-1" />
                Automated message
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Box */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <EnvelopeIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <PhoneIcon className="h-5 w-5" />
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Type your message here... (Shift + Enter for new line)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
            />
          </div>
          <button className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105">
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Press Enter to send</span>
          </div>
          <span className="text-xs text-gray-400">
            <span className="font-medium">1</span> attachment allowed
          </span>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-indigo-600" />
          </div>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">No conversation selected</h3>
        <p className="mt-2 text-sm text-gray-500">
          Choose a conversation from the list or start a new one to begin messaging
        </p>
        <button
          onClick={() => setShowCompose(true)}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center mx-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Message
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <ConversationList />
        {selectedConversation ? <MessageThread /> : <EmptyState />}
      </div>
      {showCompose && (
        <ComposeMessage
          onClose={() => setShowCompose(false)}
          onSuccess={(id) => {
            setShowCompose(false);
            setSelectedConversation(id);
            fetchConversations();
          }}
        />
      )}
    </DashboardLayout>
  );
}