import { View, Text, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { bgPrimarColor } from '@/utils/colors';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import PillCardSetting from '@/components/ui/PillCardSetting';
import { postAPI } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { ZodChecker } from '@/utils';

interface SoundSettings {
  soundEffects: boolean;
  vibration: boolean;
  keyboardSounds: boolean;
  notificationSounds: boolean;
  callSounds: boolean;
  messageSounds: boolean;
  systemSounds: boolean;
}

const SoundVibration = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<SoundSettings>({
    soundEffects: true,
    vibration: true,
    keyboardSounds: false,
    notificationSounds: true,
    callSounds: true,
    messageSounds: true,
    systemSounds: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key: keyof SoundSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/sound-settings`,
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
          text1: 'Sound & vibration settings saved',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to save sound settings',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred while saving settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    setSettings({
      soundEffects: true,
      vibration: true,
      keyboardSounds: false,
      notificationSounds: true,
      callSounds: true,
      messageSounds: true,
      systemSounds: true,
    });
    Toast.show({
      type: 'success',
      text1: 'Settings reset to defaults',
    });
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Sound & Vibration'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Audio Settings
          </Text>

          <PillCardSetting
            title="Sound Effects"
            leftElement={<Feather name="volume-2" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.soundEffects} 
                onValueChange={() => handleToggle('soundEffects')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.soundEffects ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Vibration"
            leftElement={<MaterialIcons name="vibration" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.vibration} 
                onValueChange={() => handleToggle('vibration')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.vibration ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Keyboard Sounds"
            leftElement={<Feather name="keyboard" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.keyboardSounds} 
                onValueChange={() => handleToggle('keyboardSounds')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.keyboardSounds ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          <Text className="text-lg font-semibold mb-4 mt-6" style={{ color: colors.text }}>
            Notification Sounds
          </Text>

          <PillCardSetting
            title="Notification Sounds"
            leftElement={<Feather name="bell" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.notificationSounds} 
                onValueChange={() => handleToggle('notificationSounds')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.notificationSounds ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Call Sounds"
            leftElement={<Feather name="phone" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.callSounds} 
                onValueChange={() => handleToggle('callSounds')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.callSounds ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Message Sounds"
            leftElement={<Feather name="message-circle" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.messageSounds} 
                onValueChange={() => handleToggle('messageSounds')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.messageSounds ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="System Sounds"
            leftElement={<Ionicons name="settings" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.systemSounds} 
                onValueChange={() => handleToggle('systemSounds')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.systemSounds ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          {/* Info Section */}
          <View className="p-4 rounded-lg mb-6 mt-6" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text className="text-base font-medium ml-3" style={{ color: colors.text }}>
                About Sound Settings
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.text + '80' }}>
              These settings control audio feedback and vibration for various app interactions. 
              Disabling sounds can help save battery life and reduce distractions.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button
              title="Reset to Defaults"
              onPress={handleResetToDefaults}
              variant="outline"
              classStyle="flex-1"
            />
            <Button
              title="Save Settings"
              onPress={handleSaveSettings}
              isLoading={isLoading}
              classStyle="flex-1"
              icon={<Feather name="save" size={18} color="#fff" />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SoundVibration;