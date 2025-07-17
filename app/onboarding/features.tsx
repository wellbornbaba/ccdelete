import React from 'react';
import { ScrollView, TouchableOpacity, View, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

// Feature data for mapping
const features = [
  {
    id: 1,
    title: 'Smart Route Planning',
    description:
      'Find the most efficient routes and match with riders going your way',
    icon: 'route',
  },
  {
    id: 2,
    title: 'Fair Fare Splitting',
    description:
      'Automatically calculates and splits fares between riders including tips',
    icon: 'calculator',
  },
  {
    id: 3,
    title: 'Group Chat',
    description:
      'Communicate easily with co-riders and coordinate pickup details',
    icon: 'facebook-messenger',
  },
];

export default function OnbordFeatures() {
  const router = useRouter();
  const { colors } = useThemeStore();

  return (
    <SafeAreaView className="flex-1">
    <View
      style={{ backgroundColor: colors.background }}
      className={`flex-1 px-6`}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.push('/(auth)')}
          className="self-end mt-3 rounded-full bg-bgColor px-3 py-1 items-center justify-center"
        >
          <Text style={{color: colors.primary}} className={`text-base `}>Skip</Text>
        </TouchableOpacity>
        <View className="w-full h-[240] items-center justify-center mt-3">
          <Image
            source={require('@/assets/images/welcome-removebg-preview2.png')}
            resizeMode="contain"
            style={tw`w-full h-full rounded-2xl`}
          />
        </View>

        <View className="mt-6 mb-12 gap-[26]">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-start justify-between">
              <View className="w-12 h-12 items-center justify-center rounded-full bg-bgColor">
                {/* <Image source={feature.icon} style={styles.icon} /> */}
                <FontAwesome6
                  name={feature.icon as any}
                  size={24}
                  color="#076472"
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-['Inter-SemiBold'] text-lg text-titleGrey">
                  {feature.title}
                </Text>
                <Text style={{color: colors.gray}} className={`text-md mt-0 `}>
                  {feature.description}
                </Text>
              </View>
              <AntDesign name="right" size={18} color={colors.gray} />
            </View>
          ))}
        </View>

        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center gap-[8]">
          <View className="w-2 h-2 rounded-full bg-gray-400" />
          <View className="w-3 h-3 rounded-full bg-bgDefault" />
          <View className="w-2 h-2 rounded-full bg-gray-400" />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/safety')}
          className="w-14 h-14 rounded-full bg-bgDefault items-center justify-center my-4 self-center"
        >
          <AntDesign name="arrowright" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
      </SafeAreaView>
  );
}
