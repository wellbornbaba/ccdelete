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

interface SecuritySettings {
  biometric: boolean;
  twoFactor: boolean;
  deviceManagement: boolean;
}

const SecuritySettings = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<SecuritySettings>({
    biometric: user?.settings?.biometric || false,
    twoFactor: user?.settings?.twoFA || false,
    deviceManagement: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSecuritySettings = async () => {
    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/security-settings`,
        {
          id: user?.id,
          ...settings,
        },
      );

      if (ZodChecker(userDataString)) {
        return;
      }

      if (userDataString.success) {
        Toast.show({
          type: 'success',
          text1: 'Security settings updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update security settings',
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
      <DashboardPagesHeader onBack={true} centerElement={'Security Settings'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 mt-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Account Security
          </Text>
          
          <Text className="text-sm mb-6" style={{ color: colors.text + '80' }}>
            Enhance your account security with these additional protection features.
          </Text>

          <PillCardSetting
            title="Biometric Login"
            leftElement={<Ionicons name="finger-print" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.biometric} 
                onValueChange={() => handleToggle('biometric')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.biometric ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />

          <PillCardSetting
            title="Two-Factor Authentication"
            leftElement={<Feather name="key" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.twoFactor} 
                onValueChange={() => handleToggle('twoFactor')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.twoFactor ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />

          <PillCardSetting
            title="Device Management"
            leftElement={<Ionicons name="phone-portrait-outline" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.deviceManagement} 
                onValueChange={() => handleToggle('deviceManagement')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.deviceManagement ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          <View className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.card }}>
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Security Features
            </Text>
            <Text className="text-xs mb-2" style={{ color: colors.text + '80' }}>
              • Biometric Login: Use fingerprint or face recognition to secure your account
            </Text>
            <Text className="text-xs mb-2" style={{ color: colors.text + '80' }}>
              • Two-Factor Authentication: Add an extra layer of security with SMS codes
            </Text>
            <Text className="text-xs" style={{ color: colors.text + '80' }}>
              • Device Management: Monitor and control devices that can access your account
            </Text>
          </View>

          <Button
            title="Save Security Settings"
            onPress={handleSaveSecuritySettings}
            isLoading={isLoading}
            classStyle="mt-8"
            icon={<Feather name="shield" size={18} color="#fff" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecuritySettings;