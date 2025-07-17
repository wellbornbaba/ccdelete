import { View, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { postAPI } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ZodChecker } from '@/utils';
import { Card } from '@/components/ui/Card';
import { SettingSwitch } from '@/components/ui/SettingSwitch';

const Notifications = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
   const { notifications, updateNotifications } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const handlNotifications = async () => {

    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/Notifications`,
        {
          id: user?.id,
        },
      );

      if (ZodChecker(userDataString)) {
        return;
      }
      

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number or password',
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
      <DashboardPagesHeader onBack={true} centerElement={'Change Password'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className=" flex-1 mt-4">
            <Text className="text-lg font-semibold mb-4">Notification Settings</Text>
      <SettingSwitch label="Push Notifications" value={notifications.push} onChange={(val) => updateNotifications('push', val)} icon={<Feather name="bell" size={18} color="#0f766e" />} />
      <SettingSwitch label="Email Notifications" value={notifications.email} onChange={(val) => updateNotifications('email', val)} icon={<Feather name="mail" size={18} color="#0f766e" />} />
      <SettingSwitch label="SMS Notifications" value={notifications.sms} onChange={(val) => updateNotifications('sms', val)} icon={<Feather name="message-square" size={18} color="#0f766e" />} />

          <Button
            title="Save"
            onPress={handlNotifications}
            isLoading={isLoading}
            classStyle="my-8"
          />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;
