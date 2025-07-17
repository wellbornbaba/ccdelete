import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { AntDesign, Feather } from '@expo/vector-icons';
import TitleHeader from '@/components/ui/Header';
import tw from 'twrnc';
import { postAPI } from '@/utils/fetch';
import Toast from 'react-native-toast-message';
import { ZodChecker } from '@/utils';

export default function LoginScreen() {
  const { companyDatas } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Simple validation
    if (!phone.trim()) {
       Toast.show({
          type: 'error',
          text1:  'Phone Number is required',
        });
      return;
    }

    try {
      setIsLoading(true);
      // Mock API call delay
      const response = await postAPI('/api/auth/reset-password', {
        phoneNumber: phone,
      });

      if (ZodChecker(response)) {
        return;
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1:  'Your new password has been sent to your phone number and email.',
        });
      } else {
         Toast.show({
          type: 'error',
          text1:  'Failed to reset password. Please try again later',
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
       Toast.show({
          type: 'error',
          text1:  'Failed to reset password. Please try again later',
        });
        
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <TitleHeader onBack={true} />

      <View
        style={{ backgroundColor: colors.background }}
        className={`flex-1 px-2 py-3`}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-6 items-center">
            <Image
              source={require('@/assets/images/logo.png')}
              resizeMode="contain"
              style={tw`w-[28] h-[28] rounded-2xl`}
            />
            <Text
              style={{ color: colors.primary }}
              className={`text-2xl mb-2 font-['Poppins-Bold']`}
            >
              Forgot Password?
            </Text>
            <Text
              style={{ color: colors.gray }}
              className="text-sm text-center px-5 font-['Inter-Regular']"
            >
              No worries, we'll help you reset your password
            </Text>
          </View>

          {/* Form Card */}
          <View className="p-2 py-3 rounded-2xl shadow-md border-slate-200 border flex-1 w-full max-w-md mt-10">
          

            <View className="mb-2 ">
              <Input
                label=""
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                autoCapitalize="none"
                icon={
                  <Feather name="phone" size={20} color={colors.text + '80'} />
                }
              />
            </View>

            {/* forgot password */}
            <Button
              title="Send OTP code"
              onPress={handleLogin}
              isLoading={isLoading}
              icon={<AntDesign name="lock" size={20} color="#FFFFFF" />}
              classStyle="mb-8"
            />

            <View className="flex-row justify-center items-center">
              <Text
                style={{ color: colors.text + '80' }}
                className="text-sm mr-1 font-['Inter-Regular']"
              >
                Remember your password?
              </Text>
              <Link href="/(auth)" asChild>
                <TouchableOpacity>
                  <Text
                    style={{ color: colors.primary }}
                    className="text-sm font-semibold font-['Inter-SemiBold']"
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View className="py-2 w-full items-center justify-center mb-8 flex-row">
              <AntDesign name="lock" size={20} color={colors.gray} />
              <Text
                style={{ color: colors.gray }}
                className={` bg-white p-2 z-20 mt-1 `}
              >
                Your information is secure with us
              </Text>
            </View>

            {/* Footer */}
            <View className="justify-center items-center bottom-0 flex-1">
              <Text
                style={{ color: colors.gray }}
                className="text-xs mr-1 font-['Inter-Regular']"
              >
                Need help? Contact our support team
              </Text>
              <Link href={`mailto:${companyDatas?.email}`} asChild>
                <TouchableOpacity>
                  <Text
                    style={{ color: colors.primary }}
                    className="text-sm font-semibold font-['Inter-SemiBold']"
                  >
                    {companyDatas?.email}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
