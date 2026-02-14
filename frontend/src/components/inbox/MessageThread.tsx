'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { format } from 'date-fns';
import {
  PaperAirplaneIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { cn, formatDateTime, getInitials } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  channel: string;
  direction: string;
  automated: boolean;
  created_at: string;
  metadata?: any;
}

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
  messages: Message[];
  assigned_to?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at?: string;
}

interface MessageThreadProps {
  conversationId: string;
  onBack: () => void;
}

interface ReplyForm {
  content: string;
  channel: 'email' | 'sms';
}

export default function MessageThread({ conversationId, onBack }: MessageThreadProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReplyForm>({
    defaultValues: {
      content: '',
      channel: 'email'
    }
  });
  
  const { token, user } = useAuthStore();
  const messageContent = watch('content');

  useEffect(() => {
    fetchConversation();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversation, 10000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageContent]);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(`/api/inbox/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversation(response.data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = async (data: ReplyForm) => {
    if (!data.content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await axios.post(`/api/inbox/conversations/${conversationId}/reply`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      reset({ content: '', channel: data.channel });
      await fetchConversation();
      toast.success('Reply sent');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const assignToMe = async () => {
    try {
      await axios.patch(`/api/inbox/conversations/${conversationId}`, {
        assigned_to_id: user?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchConversation();
      toast.success('Conversation assigned to you');
    } catch (error) {
      toast.error('Failed to assign conversation');
    }
  };

  const markAsResolved = async () => {
    try {
      await axios.patch(`/api/inbox/conversations/${conversationId}`, {
        status: 'resolved'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchConversation();
      toast.success('Conversation marked as resolved');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Conversation not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            This conversation may have been deleted or you don't have access.
          </p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-3 w-3 mr-1" />
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                {conversation.contact ? (
                  <span className="text-sm font-medium text-primary-700">
                    {getInitials(conversation.contact.name || 'Unknown')}
                  </span>
                ) : (
                  <UserCircleIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {conversation.contact?.name || 'Unknown Customer'}
                </h2>
                <div className="flex items-center space-x-3 mt-1">
                  {conversation.contact?.email && (
                    <div className="flex items-center text-xs text-gray-500">
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      {conversation.contact.email}
                    </div>
                  )}
                  {conversation.contact?.phone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {conversation.contact.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!conversation.assigned_to && (
              <button
                onClick={assignToMe}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <UserCircleIcon className="h-3 w-3 mr-1" />
                Assign to me
              </button>
            )}
            {conversation.status === 'active' && (
              <button
                onClick={markAsResolved}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Mark resolved
              </button>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conversation details panel */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Subject</p>
              <p className="text-sm text-gray-900">{conversation.subject || 'No subject'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                conversation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              )}>
                {conversation.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm text-gray-900">{formatDateTime(conversation.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned to</p>
              <p className="text-sm text-gray-900">
                {conversation.assigned_to?.name || 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Message count</p>
              <p className="text-sm text-gray-900">{conversation.messages.length} messages</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Last activity</p>
              <p className="text-sm text-gray-900">
                {conversation.updated_at ? formatDateTime(conversation.updated_at) : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages.map((message, index) => {
          const isInbound = message.direction === 'inbound';
          const isAutomated = message.automated;
          const showDate = index === 0 || 
            format(new Date(message.created_at), 'yyyy-MM-dd') !== 
            format(new Date(conversation.messages[index - 1].created_at), 'yyyy-MM-dd');

          return (
            <div key={message.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                    {format(new Date(message.created_at), 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
              
              <div className={cn(
                'flex',
                isInbound ? 'justify-start' : 'justify-end'
              )}>
                <div className={cn(
                  'max-w-[70%] space-y-1',
                  isInbound ? 'items-start' : 'items-end'
                )}>
                  {/* Sender info */}
                  <div className={cn(
                    'flex items-center space-x-2 text-xs',
                    isInbound ? 'justify-start' : 'justify-end'
                  )}>
                    <span className="font-medium text-gray-700">
                      {isInbound 
                        ? (conversation.contact?.name || 'Customer')
                        : (message.automated ? 'CareOps Bot' : 'You')}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      {format(new Date(message.created_at), 'h:mm a')}
                    </span>
                    {message.channel && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center text-gray-500">
                          {message.channel === 'email' ? (
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                          ) : message.channel === 'sms' ? (
                            <PhoneIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                          )}
                          {message.channel}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={cn(
                    'rounded-lg px-4 py-2',
                    isInbound
                      ? 'bg-white border border-gray-200'
                      : isAutomated
                        ? 'bg-gray-100 border border-gray-200'
                        : 'bg-primary-600 text-white'
                  )}>
                    <p className={cn(
                      'text-sm whitespace-pre-wrap',
                      !isInbound && !isAutomated && 'text-white'
                    )}>
                      {message.content}
                    </p>
                  </div>

                  {/* Automated message indicator */}
                  {isAutomated && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Automated message
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply box */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Channel selector */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('channel')}
                value="email"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                Email
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('channel')}
                value="sms"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1" />
                SMS
              </span>
            </label>
          </div>

          {/* Message input */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                {...register('content', { required: 'Message cannot be empty' })}
                ref={textareaRef}
                rows={1}
                onKeyDown={handleKeyDown}
                placeholder="Type your reply... (Shift + Enter for new line)"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={sending || !messageContent?.trim()}
              className="inline-flex items-center justify-center p-3 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-3 w-3 mr-1" />
                Send Form
              </button>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                Send Booking Link
              </button>
            </div>
            <span className="text-xs text-gray-400">
              Press Enter to send
            </span>
          </div>
        </form>

        {/* Automation paused indicator */}
        {conversation.messages.some(m => m.direction === 'outbound' && !m.automated) && (
          <div className="mt-3 flex items-center justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Automation paused - manual reply sent
            </span>
          </div>
        )}
      </div>
    </div>
  );
}