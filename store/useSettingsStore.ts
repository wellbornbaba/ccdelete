import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultSettings = {
  qualityThreshold: 0.75,
  autoUpload: true,
  compressionQuality: 0.8,
  maxRetries: 3,
  enableBiometrics: true,
  enableEncryption: true,
};

type SettingsStore = {
  biometric: boolean;
  twoFactor: boolean;
  deviceManagement: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark';
  language: string;
  qualityThreshold: number;
  autoUpload: boolean;
  compressionQuality: number;
  maxRetries: number;
  enableBiometrics: boolean;
  enableEncryption: boolean;

  // Actions
  setQualityThreshold: (threshold: number) => void;
  setAutoUpload: (enabled: boolean) => void;
  setCompressionQuality: (quality: number) => void;
  setMaxRetries: (retries: number) => void;
  setEnableBiometrics: (enabled: boolean) => void;
  setEnableEncryption: (enabled: boolean) => void;
  resetSettings: () => void;

  toggle: (key: keyof Omit<SettingsStore, 'toggle'>) => void;
  updateNotifications: (
    key: keyof SettingsStore['notifications'],
    value: boolean,
  ) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  biometric: true,
  twoFactor: false,
  deviceManagement: true,
  notifications: {
    push: true,
    email: false,
    sms: true,
  },
  theme: 'light',
  language: 'en',
  ...defaultSettings,

  toggle: (key) => set((state: any) => ({ [key]: !state[key] })),
  updateNotifications: (key, value) =>
    set((state) => ({
      notifications: { ...state.notifications, [key]: value },
    })),
  setTheme: (theme) => set({ theme }),
  setLanguage: (lang) => set({ language: lang }),

  setQualityThreshold: (threshold) => set({ qualityThreshold: threshold }),
  setAutoUpload: (enabled) => set({ autoUpload: enabled }),
  setCompressionQuality: (quality) => set({ compressionQuality: quality }),
  setMaxRetries: (retries) => set({ maxRetries: retries }),
  setEnableBiometrics: (enabled) => set({ enableBiometrics: enabled }),
  setEnableEncryption: (enabled) => set({ enableEncryption: enabled }),
  resetSettings: () => set(defaultSettings),
}));
