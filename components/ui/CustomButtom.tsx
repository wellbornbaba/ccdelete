import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function CustomButtom() {
  return (
    <View className="mt-6">
      <Button
        title="Continue"
        onPress={() => router.push('/onboarding')}
        icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
        classStyle="mb-3"
      />
      <Button
        title="Skip"
        onPress={() => router.push('/auth/signup')}
        variant="outline"
        classStyle="mb-3"
      />
    </View>
  );
  }