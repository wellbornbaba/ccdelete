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

interface PrivacySettings {
  profileVisible: boolean;
  activityStatus: boolean;
  locationServices: boolean;
  shareRideInfo: boolean;
  allowContactSync: boolean;
  dataCollection: boolean;
  personalizedAds: boolean;
  crashReporting: boolean;
}

const PrivacySettings = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisible: user?.settings?.profile_visible || true,
    activityStatus: user?.settings?.activity_status || true,
    locationServices: user?.settings?.location_services || true,
    shareRideInfo: true,
    allowContactSync: false,
    dataCollection: true,
    personalizedAds: false,
    crashReporting: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/privacy-settings`,
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
          text1: 'Privacy settings updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update privacy settings',
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

  const handleDataRequest = () => {
    Toast.show({
      type: 'success',
      text1: 'Data export request submitted',
    });
  };

  const handleDeleteAccount = () => {
    Toast.show({
      type: 'error',
      text1: 'Account deletion request submitted',
    });
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Privacy Settings'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Profile Privacy
          </Text>

          <PillCardSetting
            title="Profile Visible to Others"
            leftElement={<Feather name="user" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.profileVisible} 
                onValueChange={() => handleToggle('profileVisible')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.profileVisible ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Show Activity Status"
            leftElement={<Feather name="activity" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.activityStatus} 
                onValueChange={() => handleToggle('activityStatus')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.activityStatus ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Share Ride Information"
            leftElement={<Feather name="share-2" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.shareRideInfo} 
                onValueChange={() => handleToggle('shareRideInfo')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.shareRideInfo ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          <Text className="text-lg font-semibold mb-4 mt-6" style={{ color: colors.text }}>
            Data & Location
          </Text>

          <PillCardSetting
            title="Location Services"
            leftElement={<Feather name="map-pin" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.locationServices} 
                onValueChange={() => handleToggle('locationServices')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.locationServices ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Allow Contact Sync"
            leftElement={<Feather name="users" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.allowContactSync} 
                onValueChange={() => handleToggle('allowContactSync')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.allowContactSync ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Data Collection for Analytics"
            leftElement={<Feather name="bar-chart-2" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.dataCollection} 
                onValueChange={() => handleToggle('dataCollection')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.dataCollection ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Personalized Ads"
            leftElement={<MaterialIcons name="ads-click" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.personalizedAds} 
                onValueChange={() => handleToggle('personalizedAds')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.personalizedAds ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={false}
          />
          
          <PillCardSetting
            title="Crash Reporting"
            leftElement={<Feather name="alert-triangle" size={18} color={bgPrimarColor} />}
            rightElement={
              <Switch 
                value={settings.crashReporting} 
                onValueChange={() => handleToggle('crashReporting')}
                trackColor={{ false: colors.border, true: bgPrimarColor + '40' }}
                thumbColor={settings.crashReporting ? bgPrimarColor : colors.text + '60'}
              />
            }
            removeBorder={true}
          />

          <Text className="text-lg font-semibold mb-4 mt-6" style={{ color: colors.text }}>
            Data Management
          </Text>

          <View className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.card }}>
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
              Export Your Data
            </Text>
            <Text className="text-sm mb-3" style={{ color: colors.text + '80' }}>
              Download a copy of your data including rides, payments, and profile information.
            </Text>
            <Button
              title="Request Data Export"
              onPress={handleDataRequest}
              variant="outline"
              size="sm"
            />
          </View>

          <View className="p-4 rounded-lg mb-6" style={{ backgroundColor: colors.card }}>
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
              Delete Account
            </Text>
            <Text className="text-sm mb-3" style={{ color: colors.text + '80' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </Text>
            <Button
              title="Delete Account"
              onPress={handleDeleteAccount}
              style={{ backgroundColor: '#ef4444' }}
              size="sm"
            />
          </View>

          {/* Info Section */}
          <View className="p-4 rounded-lg mb-6" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text className="text-base font-medium ml-3" style={{ color: colors.text }}>
                Your Privacy Matters
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.text + '80' }}>
              We're committed to protecting your privacy. These settings give you control over 
              how your data is used and shared. For more details, review our Privacy Policy.
            </Text>
          </View>

          <Button
            title="Save Privacy Settings"
            onPress={handleSaveSettings}
            isLoading={isLoading}
            classStyle="mb-4"
            icon={<Feather name="save" size={18} color="#fff" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettings;