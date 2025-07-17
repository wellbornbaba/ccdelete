import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather, MaterialIcons,AntDesign } from '@expo/vector-icons';
import { storeLocally } from '@/utils/fetch';


export default function SafetyScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();

  const safetyFeatures = [
    {
      icon: (
        <MaterialIcons name="verified-user" size={24} color={colors.primary} />
      ),
      title: 'Verified Users',
      description:
        'All users are verified through a comprehensive verification process.',
    },
    {
      icon: <Feather name="user-check" size={24} color={colors.primary} />,
      title: 'Profile Reviews',
      description:
        'User ratings and reviews help maintain a trusted community.',
    },
    {
      icon: <Feather name="bell" size={24} color={colors.primary} />,
      title: 'Real-time Alerts',
      description: 'Get instant notifications about your ride and co-riders.',
    },
    {
      icon: <Feather name="lock" size={24} color={colors.primary} />,
      title: 'Secure Payments',
      description: 'All transactions are protected with bank-level security.',
    },
  ];

  const handleGetStarted = async () => {
    // Store that user has seen the onboarding
    await storeLocally('hasSeenOnboarding', true);
    router.push('/(auth)');
  }

  return (
    <SafeAreaView className="flex-1">
    <View
      style={{backgroundColor: colors.background}} className={`flex-1 px-6`}
      
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={{ color: colors.primary }}
          className={`text-2xl font-['Poppins-Bold'] text-center mt-12`}
        >
          Your Safety is Our Priority
        </Text>
        <Text
          style={{ color: colors.gray }}
          className={`text-center mb-8 text-sm font-['Inter-Regular'] `}
        >
          We've implemented multiple features to ensure your safety and security
        </Text>

        <View className=" items-center justify-center mt-0">
          <Feather name="shield" size={94} color={colors.success} />
        </View>

        <View className="my-8 gap-[24]">
          {safetyFeatures.map((feature, index) => (
            <View key={index} className="flex-row items-start">
              <View className="w-12 h-12 items-center justify-center rounded-full bg-bgColor">
                {feature.icon}
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-['Inter-Medium'] text-base text-titleGrey">
                  {feature.title}
                </Text>
                <Text style={{color: colors.gray}} className={`text-md mt-0 `}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-4">
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            classStyle="mb-6"
            iconRight={<View className=" ml-3">
              <AntDesign name="arrowright" size={24} color="white" />
            </View>}
          />
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
