'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function useDarkMode() {
  const { darkMode, toggleDarkMode } = useSettingsStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return { darkMode, toggleDarkMode };
}