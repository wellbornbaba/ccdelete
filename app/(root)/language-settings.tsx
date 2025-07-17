import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { bgPrimarColor } from '@/utils/colors';
import Toast from 'react-native-toast-message';
import PillCardSetting from '@/components/ui/PillCardSetting';
import { Button } from '@/components/ui/Button';
import { postAPI } from '@/utils/fetch';
import { ZodChecker } from '@/utils';

const LanguageSettings = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.settings?.language || 'English');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageSelect = (language: any) => {
    setSelectedLanguage(language.name);
  };

  const handleSaveLanguage = async () => {
    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/language-settings`,
        {
          id: user?.id,
          language: selectedLanguage,
        },
      );

      if (ZodChecker(userDataString)) {
        return;
      }

      if (userDataString.success) {
        Toast.show({
          type: 'success',
          text1: `Language changed to ${selectedLanguage}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update language settings',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred while updating language',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Language Settings'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Select Your Language
          </Text>
          
          <Text className="text-sm mb-6" style={{ color: colors.text + '80' }}>
            Choose your preferred language for the app interface
          </Text>

          {languages.map((language, index) => (
            <PillCardSetting
              key={index}
              title={
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{language.flag}</Text>
                  <View>
                    <Text className="text-base font-medium" style={{ color: colors.text }}>
                      {language.name}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text + '80' }}>
                      {language.code.toUpperCase()}
                    </Text>
                  </View>
                </View>
              }
              leftElement={<View />}
              rightElement={
                selectedLanguage === language.name ? (
                  <MaterialIcons name="radio-button-checked" size={24} color={bgPrimarColor} />
                ) : (
                  <MaterialIcons name="radio-button-unchecked" size={24} color={colors.text + '40'} />
                )
              }
              onpress={() => handleLanguageSelect(language)}
              removeBorder={index === languages.length - 1}
            />
          ))}

          {/* Info Section */}
          <View className="p-4 rounded-lg mt-6" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text className="text-base font-medium ml-3" style={{ color: colors.text }}>
                Language Support
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.text + '80' }}>
              The app will restart to apply the new language settings. Some features may not be 
              fully translated in all languages. We're continuously working to improve translations.
            </Text>
          </View>

          <Button
            title="Save Language Settings"
            onPress={handleSaveLanguage}
            isLoading={isLoading}
            classStyle="mt-6"
            icon={<Ionicons name="language" size={18} color="#fff" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSettings;