import { View, Text, ScrollView, Switch } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { postAPI } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { ZodChecker } from '@/utils';
import PillCardSetting from '@/components/ui/PillCardSetting';
import { bgPrimarColor } from '@/utils/colors';

interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
}

const Notifications = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<NotificationSettings>({
    push: true,
    email: true,
    sms: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.notifications) {
      setSettings({
        push: user.notifications.push || false,
        email: user.notifications.email || false,
        sms: user.notifications.sms || false,
      });
    }
  }, [user]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/notifications`,
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
          text1: 'Notification settings updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update notification settings',
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
      <DashboardPagesHeader onBack={true} centerElement={'Notification Settings'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 mt-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Notification Preferences
          </Text>
          
          <Text className="text-sm mb-6" style={{ color: colors.text + '80' }}>
            Choose how you want to receive notifications about your rides and account updates.
          </Text>

          <PillCardSetting
            title="Push Notifications"
            leftElement={<Feather name="bell" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.push} 
                onValueChange={() => handleToggle('push')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.push ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />

          <PillCardSetting
            title="Email Notifications"
            leftElement={<Feather name="mail" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.email} 
                onValueChange={() => handleToggle('email')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.email ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />

          <PillCardSetting
            title="SMS Notifications"
            leftElement={<Feather name="message-square" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.sms} 
                onValueChange={() => handleToggle('sms')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.sms ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          <View className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.card }}>
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              About Notifications
            </Text>
            <Text className="text-xs" style={{ color: colors.text + '80' }}>
              • Push notifications: Instant alerts on your device
              • Email notifications: Updates sent to your email address
              • SMS notifications: Text messages to your phone number
            </Text>
          </View>

          <Button
            title="Save Settings"
            onPress={handleSaveNotifications}
            isLoading={isLoading}
            classStyle="mt-8"
            icon={<Feather name="save" size={18} color="#fff" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;