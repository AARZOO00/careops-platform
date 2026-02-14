'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { cn, isValidEmail, isValidPhone } from '@/lib/utils';

interface ComposeMessageProps {
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
  initialContact?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

interface ComposeForm {
  channel: 'email' | 'sms';
  recipient: string;
  name: string;
  subject: string;
  content: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ConversationResponse {
  conversations: Array<{
    id: string;
    contact: Contact | null;
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
  }>;
  total: number;
}

export default function ComposeMessage({ onClose, onSuccess, initialContact }: ComposeMessageProps) {
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ComposeForm>({
    defaultValues: {
      channel: initialContact?.email ? 'email' : 'sms',
      recipient: initialContact?.email || initialContact?.phone || '',
      name: initialContact?.name || '',
      subject: '',
      content: ''
    }
  });

  const { token } = useAuthStore();
  const channel = watch('channel');

  // Search contacts
  const searchContacts = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get<ConversationResponse>('/api/inbox/conversations', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: term, limit: 5 }
      });
      
      // Safely extract contacts with proper typing
      const contacts: Contact[] = response.data.conversations
        .map(conv => conv.contact)
        .filter((contact): contact is Contact => {
          return contact !== null && 
                 typeof contact === 'object' && 
                 'id' in contact && 
                 'name' in contact;
        });
      
      // Deduplicate by id
      const uniqueContacts = Array.from(
        new Map(contacts.map(c => [c.id, c])).values()
      );
      
      setSearchResults(uniqueContacts);
    } catch (error) {
      console.error('Failed to search contacts:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Simple debounce
    const timeoutId = setTimeout(() => {
      searchContacts(term);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setValue('name', contact.name);
    setValue('recipient', contact.email || contact.phone || '');
    setValue('channel', contact.email ? 'email' : 'sms');
    setShowContactSearch(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const onSubmit = async (data: ComposeForm) => {
    if (!data.recipient.trim()) {
      toast.error(`Please enter a ${channel === 'email' ? 'email address' : 'phone number'}`);
      return;
    }

    if (channel === 'email' && !isValidEmail(data.recipient)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (channel === 'sms' && !isValidPhone(data.recipient)) {
      toast.error('Please enter a valid phone number (E.164 format: +1234567890)');
      return;
    }

    if (!data.content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      
      const payload: {
        channel: 'email' | 'sms';
        content: string;
        contact_name: string;
        contact_email?: string;
        contact_phone?: string;
      } = {
        channel: data.channel,
        content: data.content,
        contact_name: data.name || data.recipient
      };

      if (data.channel === 'email') {
        payload.contact_email = data.recipient;
      } else {
        payload.contact_phone = data.recipient;
      }

      const response = await axios.post<{ conversation_id: string; message_id: string; contact_id: string }>(
        '/api/inbox/messages', 
        payload, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Message sent successfully!');
      onSuccess(response.data.conversation_id);
      reset();
      onClose();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Message</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {/* Channel selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send via
                </label>
                <div className="flex space-x-4">
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
              </div>

              {/* Contact search/selection */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {channel === 'email' ? 'Email address' : 'Phone number'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactSearch(!showContactSearch);
                      setSearchResults([]);
                      setSearchTerm('');
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    {showContactSearch ? 'Enter manually' : 'Select existing contact'}
                  </button>
                </div>

                {showContactSearch ? (
                  <div className="mt-1 relative">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search contacts by name or email..."
                        className="block w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    {isSearching && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4 text-center">
                        <div className="inline-block h-5 w-5 border-t-2 border-primary-600 rounded-full animate-spin"></div>
                        <p className="mt-1 text-xs text-gray-500">Searching...</p>
                      </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                        {searchResults.map((contact) => (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => handleSelectContact(contact)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary-700">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {contact.email || contact.phone}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!isSearching && searchTerm.trim() !== '' && searchResults.length === 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4 text-center">
                        <p className="text-sm text-gray-500">No contacts found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try a different search term or enter manually
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1">
                    <input
                      {...register('recipient', { 
                        required: `${channel === 'email' ? 'Email' : 'Phone number'} is required`,
                        pattern: channel === 'email' 
                          ? {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          : {
                              value: /^\+[1-9]\d{1,14}$/,
                              message: 'Invalid phone format. Use E.164 format: +1234567890'
                            }
                      })}
                      type={channel === 'email' ? 'email' : 'tel'}
                      placeholder={channel === 'email' 
                        ? 'customer@example.com' 
                        : '+1234567890'
                      }
                      className={cn(
                        'block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
                        errors.recipient && 'border-red-300'
                      )}
                    />
                    {errors.recipient && (
                      <p className="mt-1 text-xs text-red-600">{errors.recipient.message}</p>
                    )}
                    {channel === 'sms' && !errors.recipient && (
                      <p className="mt-1 text-xs text-gray-500">
                        Format: +1234567890 (include country code)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Contact name
                </label>
                <div className="mt-1">
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="John Doe"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Used for display purposes only
                </p>
              </div>

              {/* Subject (email only) */}
              {channel === 'email' && (
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('subject')}
                      type="text"
                      placeholder="What's this about?"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Message content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Message
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('content', { required: 'Message is required' })}
                    rows={6}
                    placeholder="Type your message here..."
                    className={cn(
                      'block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
                      errors.content && 'border-red-300'
                    )}
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={sending}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}