import { View, Text, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { postAPI } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { ZodChecker } from '@/utils';
import PillCardSetting from '@/components/ui/PillCardSetting';
import { bgPrimarColor } from '@/utils/colors';

const DisplayTheme = () => {
  const { colors, mode, setThemeMode } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const [isDarkMode, setIsDarkMode] = useState(mode === 'dark');
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeToggle = async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    await setThemeMode(newMode);
  };

  const handleSaveDisplaySettings = async () => {
    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/display-settings`,
        {
          id: user?.id,
          theme: isDarkMode ? 'dark' : 'light',
        },
      );

      if (ZodChecker(userDataString)) {
        return;
      }

      if (userDataString.success) {
        Toast.show({
          type: 'success',
          text1: 'Display settings updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update display settings',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred while updating settings',
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
      <DashboardPagesHeader onBack={true} centerElement={'Display & Theme'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 mt-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Appearance Settings
          </Text>
          
          <Text className="text-sm mb-6" style={{ color: colors.text + '80' }}>
            Customize how the app looks and feels to match your preferences.
          </Text>

          <PillCardSetting
            title="Dark Mode"
            leftElement={<Feather name="moon" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={isDarkMode} 
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={isDarkMode ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          <View className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text className="text-sm font-medium ml-2" style={{ color: colors.text }}>
                About Dark Mode
              </Text>
            </View>
            <Text className="text-xs" style={{ color: colors.text + '80' }}>
              Dark mode reduces eye strain in low-light conditions and can help save battery life on devices with OLED screens. The theme will be applied immediately across the entire app.
            </Text>
          </View>

          <View className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Current Theme: {isDarkMode ? 'Dark' : 'Light'}
            </Text>
            <View className="flex-row items-center">
              <View 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: colors.primary }}
              />
              <Text className="text-xs" style={{ color: colors.text + '80' }}>
                Primary Color Preview
              </Text>
            </View>
          </View>

          <Button
            title="Save Display Settings"
            onPress={handleSaveDisplaySettings}
            isLoading={isLoading}
            classStyle="mt-8"
            icon={<Feather name="monitor" size={18} color="#fff" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DisplayTheme;