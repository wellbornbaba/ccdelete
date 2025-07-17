import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';

const languages = ['en', 'es', 'fr'] as const;

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-2 p-4">
      <Text>{t('common.language')}:</Text>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang}
          onPress={() => setLanguage(lang)}
          className={`px-3 py-1 rounded-full ${
            lang === language ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white uppercase">{lang}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}