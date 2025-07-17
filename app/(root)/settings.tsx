import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather, Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import PillCardSetting from '@/components/ui/PillCardSetting';
import { router } from 'expo-router';
import { bgPrimarColor } from '@/utils/colors';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const { colors, mode, setThemeMode } = useThemeStore();
  const { companyDatas, signOut, user} = useAuthStore();

  // Payment method state (mock)
  const [defaultPayment, setDefaultPayment] = useState('Credit Card');

  // Notification settings (mock)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  // Privacy settings (mock)
  const [locationTracking, setLocationTracking] = useState(true);
  const [shareRideInfo, setShareRideInfo] = useState(true);

  // Mock dark background for comparison
  const darkBackground = '#111827';
  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' && colors.background === darkBackground);

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Settings'} />

      <ScrollView
        className="flex-1 "
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <Text className="text-lg font-semibold mt-4 mb-2 px-1 uppercase text-bgDefault dark:text-white">
          Account
        </Text>
        <Card classStyle="mb-4">
          <PillCardSetting
            onpress={() => router.push('/(root)/personal-information')}
            title="Personal Information"
            leftElement={<Feather name="user" size={20} color={bgPrimarColor} />}
          />
          {user?.accountType ==="driver" && (
          <PillCardSetting
            onpress={() => router.push('/(root)/bank-account')}
            title="Bank Account Details"
            leftElement={
              <Ionicons name="wallet" size={20} color={bgPrimarColor} />
            }
          />)}
          <PillCardSetting
          onpress={() => router.push("/(root)/change-password")}
            title="Change Password"
            leftElement={<Feather name="lock" size={20} color={bgPrimarColor} />}
          />
          <PillCardSetting
            onpress={() => router.push('/(root)/verification-status')}
            title="Verification Status"
            leftElement={
              <Ionicons name="shield-checkmark" size={20} color={bgPrimarColor} />
            }
          />
          {/* <PillCardSetting
            onpress={() => router.push('/(root)/language-settings')}
            title="Language"
            leftElement={
              <Ionicons name="language" size={20} color={bgPrimarColor} />
            }
            removeBorder={true}
          /> */}

        </Card>

        {/* Preferences */}
        <Text className="text-lg font-semibold mt-4 mb-2 px-1 uppercase text-bgDefault dark:text-white">
          Preferences
        </Text>
        <Card classStyle="mb-4">
          {/* <PillCardSetting
            onpress={() => router.push("/(root)/notifications")}
            title="Notifications"
            leftElement={<Feather name="bell" size={20} color={bgPrimarColor} />}
          />
          <PillCardSetting
            onpress={() => router.push('/(root)/displaytheme')}
            title="Dark Mode"
            leftElement={
              <Ionicons name="moon" size={20} color={bgPrimarColor} />
            }
          />
          <PillCardSetting
            onpress={() => router.push('/(root)/sound-vibration')}
            title="Sound & Vibration"
            leftElement={<Feather name="volume" size={20} color={bgPrimarColor} />}
          /> */}
          <PillCardSetting
            onpress={() => router.push('/(root)/privacy-settings')}
            title="Privacy Settings"
            leftElement={
              <MaterialIcons name="privacy-tip" size={20} color={bgPrimarColor} />
            }
            removeBorder={true}
          />
         
        </Card>

        {/* Payment Settings */}
        {user?.accountType ==="driver" && (
          <>
          <Text className="text-lg font-semibold mt-4 mb-2 px-1 uppercase text-bgDefault dark:text-white">
          Payment Settings
        </Text>
        <Card classStyle="mb-4">
          <PillCardSetting
            onpress={() => router.push('/(root)/payment-methods')}
            title="Payment Methods"
            leftElement={<Feather name="credit-card" size={20} color={bgPrimarColor} />}
            removeBorder={true}
          />
         
        </Card></>)}

         {/* Support & Info */}
        <Text className="text-lg font-semibold mt-4 mb-2 px-1 uppercase text-bgDefault dark:text-white">
          Support & Info
        </Text>
        <Card classStyle="mb-4">
          <PillCardSetting
            onpress={() => router.push("/support")}
            title="Help Center"
            leftElement={<MaterialIcons name="contact-support" size={20} color={bgPrimarColor} />}
          />
           <PillCardSetting
            onpress={() => router.push("/(auth)/terms")}
            title="Terms Of Service"
            leftElement={<Feather name="file-text" size={20} color={bgPrimarColor} />}
          />
          <PillCardSetting
            onpress={() => router.push("/(auth)/privacy")}
            title="Privacy & Policy"
            leftElement={<Feather name="file-text" size={20} color={bgPrimarColor} />}
            removeBorder={true}
          />
         
        </Card>

        {/* App Info */}
         <PillCardSetting
            onpress={() => signOut()}
            title="Log out"
            leftElement={<SimpleLineIcons name="logout" size={20} color={"#b91c1c"} />}
            removeBorder={true}
          />
         
        <View className="mt-6 items-center">
          <Text className="text-sm text-black/40 dark:text-white/50 mb-1 items-center">
            Version {companyDatas?.appVersion}  {" "} 
           
          </Text>
          <Text className="text-xs text-black/40 dark:text-white/50">
            ©2025 {companyDatas?.name} App. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}