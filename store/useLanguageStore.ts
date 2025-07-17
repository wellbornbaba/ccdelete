import { create } from 'zustand';

export type Language = 'en' | 'es' | 'fr';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAppLoading: boolean;
  setIsAppLoading: (isapp: boolean) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'en',
  isAppLoading: false,

  setIsAppLoading(isapp) {
    set({ isAppLoading: isapp });
  },
  setLanguage: (lang) => set({ language: lang }),
}));