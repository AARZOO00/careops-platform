import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          title: 'New Booking',
          message: 'Sarah Johnson booked a consultation',
          type: 'info',
          read: false,
          timestamp: new Date(Date.now() - 5 * 60000),
          link: '/bookings/1'
        },
        {
          id: '2',
          title: 'Low Stock Alert',
          message: 'Printer paper is running low (2 reams left)',
          type: 'warning',
          read: false,
          timestamp: new Date(Date.now() - 15 * 60000),
          link: '/inventory/3'
        },
        {
          id: '3',
          title: 'Payment Received',
          message: '$99 payment from Michael Chen',
          type: 'success',
          read: true,
          timestamp: new Date(Date.now() - 60 * 60000),
          link: '/bookings/2'
        },
        {
          id: '4',
          title: 'System Update',
          message: 'New features available',
          type: 'info',
          read: true,
          timestamp: new Date(Date.now() - 120 * 60000),
          link: '/changelog'
        }
      ],
      get unreadCount() {
        return get().notifications.filter(n => !n.read).length;
      },
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          read: false,
          timestamp: new Date(),
          ...notification
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      },
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      clearAll: () => {
        set({ notifications: [] });
      }
    }),
    {
      name: 'careops-notifications',
    }
  )
);