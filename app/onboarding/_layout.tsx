import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none', // Disable default animations since we'll handle sliding
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}