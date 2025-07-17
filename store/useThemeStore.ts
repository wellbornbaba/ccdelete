// stores/useThemeStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';
import { Colors, Gradients, ThemeMode, ThemeState } from '@/types';
import { darkColors, darkGradients, lightColors, lightGradients } from '@/utils/colors';

interface ThemeStore extends ThemeState {
  colors: Colors;
  gradients: Gradients;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
}


export const useThemeStore = create<ThemeStore>((set, get) => {
  const systemScheme = 'light';  
  // const systemScheme = useColorScheme() || 'light';

  const isDark = (mode: ThemeMode, systemMode: ThemeMode) =>
    mode === 'dark' || (mode === 'system' && systemMode === 'dark');

  const applyTheme = (mode: ThemeMode, systemMode: ThemeMode) => {
    const darkMode = isDark(mode, systemMode);
    return {
      mode,
      systemMode: systemMode === 'system' ? undefined : systemMode,
      colors: darkMode ? darkColors : lightColors,
      gradients: darkMode ? darkGradients : lightGradients,
    };
  };

  return {
    mode: 'system',
    systemMode: systemScheme,
    colors: isDark('system', systemScheme) ? darkColors : lightColors,
    gradients: isDark('system', systemScheme) ? darkGradients : lightGradients,

    setThemeMode: async (mode: ThemeMode) => {
      try {
        await SecureStore.setItemAsync('themeMode', mode);
        const systemMode = useColorScheme() || 'light';
        set(applyTheme(mode, systemMode));
      } catch (e) {
        console.error('Failed to save theme mode:', e);
      }
    },

    initializeTheme: async () => {
      try {
        const savedMode = (await SecureStore.getItemAsync('themeMode')) as ThemeMode;
        const mode = savedMode || 'system';
        const systemMode = useColorScheme() || 'light';
        set(applyTheme(mode, systemMode));
      } catch (e) {
        console.error('Failed to initialize theme:', e);
      }
    },
  };
});
