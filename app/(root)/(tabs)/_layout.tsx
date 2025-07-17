import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import BgLoading from '@/components/BgLoading';

const driverAttension = ["pending", "rejected"];

export default function TabLayout() {
  const { user, isHydrated, isLoginAuth } = useAuthStore();
  const router = useRouter();
  const { colors } = useThemeStore();
  // useEffect(() => {
  //   if (!isHydrated && !isLoginAuth) {
  //     // Redirect to login if not authenticated
  //     router.replace('/(auth)');
  //   }

  //   if (user && user.kycScore?.status !=="verified") {
  //     return router.replace('/(root)/verification-status');
  //   }

  //   if(user && user.accountType ==="driver" && driverAttension.includes(user.driver?.dstatus || "pending")) {
  //     return router.replace("/(root)/driver-form")
  //   }
    
  // }, [user, isHydrated, router]);

  // Don't render tabs if not authenticated or still loading
  if (!isHydrated || !user) {
    return <BgLoading />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text + '60',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          top: 0,
          height: '14%',
          // marginVertical: 5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: user.accountType === 'driver' ? 'Trips' : 'Rides',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
          headerTitle: user.accountType === 'driver' ? 'Trips' : 'Rides',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          headerTitle: 'Wallet',
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerTitle: 'Support Center',
        }}
      />
    </Tabs>
  );
}
