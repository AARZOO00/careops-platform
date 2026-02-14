import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  updateNotifications: (key: string, value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarCollapsed: false,
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      updateNotifications: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),
    }),
    {
      name: 'careops-settings',
    }
  )
);