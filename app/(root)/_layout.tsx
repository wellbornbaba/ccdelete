import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { Stack, useRouter } from 'expo-router';
import { StackAnimationTypes } from 'react-native-screens';
import { Platform } from 'react-native';
import BgLoading from '@/components/BgLoading';

const RootLayout = () => {
  const { user, isHydrated, isLoginAuth } = useAuthStore();
  // const { isLoaded, isSignedIn, user: clerkUser } = useClerkAuth();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    // if (!isLoaded) return; // Wait for Clerk to load
    
    // If user is signed in with Clerk but not with legacy auth, redirect to tabs
    // if (isSignedIn && clerkUser) {
    //   router.replace('/(root)/(tabs)');
    //   return;
    // }
    
    // Legacy auth check
    if (!isHydrated && !user) {
      router.replace('/(auth)');
      return;
    }

    if (user && !isLoginAuth) {
      router.replace('/(auth)');
      return;
    }
  }, [user, isHydrated, router, isLoginAuth]);
  // }, [user, isHydrated, router, isLoaded, isSignedIn, clerkUser, isLoginAuth]);

  // Show loading while checking authentication
  // if (!isLoaded || (!isHydrated && !isSignedIn)) {
  //   return <BgLoading />;
  // }

  // Don't render if not authenticated
  // if (!isSignedIn && !user) {
  //   return <BgLoading />;
  // }
   if (!user) {
    return <BgLoading />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="account" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="driver-request-confirmation" />
      <Stack.Screen name="driver-withdraw-fund" />
      <Stack.Screen name="add-bank-account" />
      <Stack.Screen name="driver-wallet" />
      <Stack.Screen
        name="(modals)/create-ride"
        options={{
          presentation: 'modal',
          animation:
            Platform.OS === 'ios'
              ? ('modal' as StackAnimationTypes)
              : ('default' as StackAnimationTypes),
        }}
      />
      <Stack.Screen
        name="(modals)/add-address"
        options={{
          presentation: 'modal',
          animation:
            Platform.OS === 'ios'
              ? ('modal' as StackAnimationTypes)
              : ('default' as StackAnimationTypes),
        }}
      />
    </Stack>
  );
};

export default RootLayout;