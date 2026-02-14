import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr: string = 'PPP') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatTime = (date: string | Date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
};

export const formatDateTime = (date: string | Date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date: string | Date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
};

export const formatDateRange = (start: string | Date, end: string | Date) => {
  if (!start || !end) return '';
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  return `${format(s, 'MMM d, yyyy')} · ${format(s, 'h:mm a')} - ${format(e, 'h:mm a')}`;
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

// Phone number formatting
export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';
  
  // Strip all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a US number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  
  // Check if it's a US number with country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  // Return as-is if it doesn't match known formats
  return phone;
};

// Name utilities
export const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// String utilities
export const truncate = (str: string, length: number = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// Color utilities
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-error',
    no_show: 'badge-error',
    rescheduled: 'badge-info',
    active: 'badge-success',
    inactive: 'badge-neutral',
  };
  return colors[status] || 'badge-neutral';
};

export const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    rescheduled: 'Rescheduled',
    active: 'Active',
    inactive: 'Inactive',
  };
  return texts[status] || status;
};

// Validation utilities
export const isValidEmail = (email: string) => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return re.test(email);
};

export const isValidPhone = (phone: string) => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/\D/g, ''));
};

// File utilities
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Local storage utilities
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return item;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

// Query parameter utilities
export const buildQueryString = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// Debounce utility
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, waitFor);
    });
  };
};

// Class name merger (similar to clsx)
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};