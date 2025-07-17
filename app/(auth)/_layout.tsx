import React from 'react'
import { Stack } from 'expo-router';

 const AuthGroup = () => {
  return (
   <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login-lock" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}

export default AuthGroup;