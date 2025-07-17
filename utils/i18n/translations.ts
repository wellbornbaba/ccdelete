export const baseTranslation = {
  home: {
    title: 'Home',
    welcome: 'Welcome back!',
  },
  profile: {
    settings: {
      label: 'Settings',
      logout: 'Log out',
    },
  },
  common: {
    language: 'Language',
  },
};

export type TranslationType = typeof baseTranslation;

export const translations: Record<string, TranslationType> = {
  en: baseTranslation,
  es: {
    home: {
      title: 'Inicio',
      welcome: '¡Bienvenido de nuevo!',
    },
    profile: {
      settings: {
        label: 'Configuraciones',
        logout: 'Cerrar sesión',
      },
    },
    common: {
      language: 'Idioma',
    },
  },
  fr: {
    home: {
      title: 'Accueil',
      welcome: 'Bon retour!',
    },
    profile: {
      settings: {
        label: 'Paramètres',
        logout: 'Se déconnecter',
      },
    },
    common: {
      language: 'Langue',
    },
  },
};

