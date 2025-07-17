import { useLanguageStore } from '@/store/useLanguageStore';
import { translations, TranslationType } from '@/utils/i18n/translations';
import { DotNestedKeys } from '@/utils/i18n/utils';

type TranslationKey = DotNestedKeys<TranslationType>;

export const useTranslation = () => {
  const { language } = useLanguageStore();

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
};
