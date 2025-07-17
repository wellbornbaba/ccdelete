import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#076572',
  secondary: '#0891b2',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#0891b2',
  secondary: '#06b6d4',
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  border: '#374151',
  error: '#f87171',
  warning: '#fbbf24',
  success: '#34d399',
  info: '#60a5fa',
};

export const useThemeAppStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      colors: lightColors,
      
      toggleTheme: () => {
        const { isDark } = get();
        const newIsDark = !isDark;
        set({
          isDark: newIsDark,
          colors: newIsDark ? darkColors : lightColors,
        });
      },
      
      setTheme: (isDark: boolean) => {
        set({
          isDark,
          colors: isDark ? darkColors : lightColors,
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);