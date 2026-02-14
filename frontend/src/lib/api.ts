import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API service functions
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) => 
      axios.post('/api/auth/token', { username: email, password }),
    register: (data: any) => 
      axios.post('/api/auth/register', data),
    me: () => 
      axios.get('/api/auth/me'),
    logout: () => 
      axios.post('/api/auth/logout'),
  },

  // Workspace
  workspace: {
    getStatus: () => 
      axios.get('/api/onboarding/status'),
    activate: () => 
      axios.post('/api/onboarding/activate'),
  },

  // Dashboard
  dashboard: {
    getMetrics: () => 
      axios.get('/api/dashboard/metrics'),
    getUpcomingBookings: (limit = 10) => 
      axios.get(`/api/dashboard/bookings/upcoming?limit=${limit}`),
    getRecentActivity: (limit = 20) => 
      axios.get(`/api/dashboard/activity/recent?limit=${limit}`),
  },

  // Inbox
  inbox: {
    getConversations: (params?: any) => 
      axios.get('/api/inbox/conversations', { params }),
    getConversation: (id: string) => 
      axios.get(`/api/inbox/conversations/${id}`),
    sendReply: (conversationId: string, data: any) => 
      axios.post(`/api/inbox/conversations/${conversationId}/reply`, data),
    sendMessage: (data: any) => 
      axios.post('/api/inbox/messages', data),
    getStats: () => 
      axios.get('/api/inbox/stats'),
  },

  // Bookings
  bookings: {
    getAll: (params?: any) => 
      axios.get('/api/bookings', { params }),
    get: (id: string) => 
      axios.get(`/api/bookings/${id}`),
    create: (data: any) => 
      axios.post('/api/bookings', data),
    update: (id: string, data: any) => 
      axios.patch(`/api/bookings/${id}`, data),
    confirm: (id: string) => 
      axios.post(`/api/bookings/${id}/confirm`),
    cancel: (id: string, reason?: string) => 
      axios.post(`/api/bookings/${id}/cancel`, { reason }),
    reschedule: (id: string, start_time: string) => 
      axios.post(`/api/bookings/${id}/reschedule`, { start_time }),
    markNoShow: (id: string) => 
      axios.post(`/api/bookings/${id}/no-show`),
    complete: (id: string) => 
      axios.post(`/api/bookings/${id}/complete`),
    checkAvailability: (serviceId: string, date?: string) => 
      axios.get(`/api/bookings/calendar/availability`, { 
        params: { service_id: serviceId, date } 
      }),
  },

  // Inventory
  inventory: {
    getAll: (params?: any) => 
      axios.get('/api/inventory', { params }),
    get: (id: string) => 
      axios.get(`/api/inventory/${id}`),
    create: (data: any) => 
      axios.post('/api/inventory', data),
    update: (id: string, data: any) => 
      axios.patch(`/api/inventory/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/api/inventory/${id}`),
    adjust: (id: string, adjustment: number, reason: string) => 
      axios.post(`/api/inventory/${id}/adjust`, { adjustment, reason }),
    recordUsage: (id: string, data: any) => 
      axios.post(`/api/inventory/${id}/usage`, data),
    getLowStock: () => 
      axios.get('/api/inventory/alerts/low-stock'),
  },

  // Forms
  forms: {
    getAll: (params?: any) => 
      axios.get('/api/forms', { params }),
    get: (id: string) => 
      axios.get(`/api/forms/${id}`),
    create: (data: any) => 
      axios.post('/api/forms', data),
    update: (id: string, data: any) => 
      axios.patch(`/api/forms/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/api/forms/${id}`),
    send: (formId: string, data: any) => 
      axios.post(`/api/forms/${formId}/send`, data),
    getSubmissions: (params?: any) => 
      axios.get('/api/forms/submissions', { params }),
  },

  // Public
  public: {
    getWorkspace: (slug: string) => 
      axios.get(`/api/public/workspace/${slug}`),
    submitContact: (slug: string, data: any) => 
      axios.post(`/api/public/contact/${slug}`, data),
    getBookingPage: (slug: string) => 
      axios.get(`/api/public/book/${slug}`),
    createBooking: (slug: string, data: any) => 
      axios.post(`/api/public/book/${slug}`, data),
    getForm: (token: string) => 
      axios.get(`/api/public/form/${token}`),
    submitForm: (token: string, data: any) => 
      axios.post(`/api/public/form/${token}`, data),
    getAvailability: (serviceId: string, date?: string) => 
      axios.get(`/api/public/availability/${serviceId}`, { params: { date } }),
  },
};

export default api;