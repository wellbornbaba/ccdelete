import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, router, Link } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { loginAccess, maskString } from '@/utils';
import Toast from 'react-native-toast-message';
import { removeLocally } from '@/utils/fetch';


export default function LoginScreen() {
  const { setUser, userBasic, setUserBasic, companyDatas, setJWTtoken } =
    useAuthStore();

    // if(!userBasic){
    //   router.replace("/(auth)")
    // }
//   removeLocally("hasSeenOnboarding");
//   removeLocally("user")
// setUserBasic(null)

  const { colors } = useThemeStore();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const phoneNumber = userBasic?.phoneNumber || '';

    try {
      setIsLoading(true);
      // Mock API call delay
      await loginAccess(
        phoneNumber,
        password,
        setJWTtoken,
        setUser,
      );
    } catch (error) {
      console.log(error);

      Toast.show({
        type: 'error',
        text1: 'Invalid password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View
        style={{ backgroundColor: colors.background }}
        className={`flex-1 px-2 pb-6 py-8`}
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
          <View className="mb-3 items-center">
            <View className="p-2 rounded-full bg-red-200 items-center justify-center my-6">
              <AntDesign name="lock" size={44} color="#FFFFFF" />
            </View>

            <Text
              style={{ color: colors.primary }}
              className={`text-2xl mb-2 font-['Poppins-Bold']`}
            >
              Welcome back!
            </Text>
            <Text
              style={{ color: colors.gray }}
              className="text-xl text-center px-5 font-['Inter-Regular']"
            >
              {maskString(`${userBasic?.phoneNumber}`, 3, 9)}
            </Text>
          </View>

          {/* Form Card */}
          <View className="p-2 py-3 rounded-2xl shadow-md border-slate-200 border flex-1 w-full max-w-md mt-10">
            <View className="mb-2 ">
              <Input
                label=""
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                keyboardType="default"
                autoCapitalize="none"
                secureTextEntry
                icon={
                  <MaterialCommunityIcons
                    name="form-textbox-password"
                    size={20}
                    color={colors.text + '80'}
                  />
                }
              />
            </View>
            <View className="justify-between">
              <TouchableOpacity
                className="self-start mb-3"
                onPress={() => router.push('/(auth)/reset-password')}
              >
                <Text className="text-sm font-semibold text-primary-900">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* forgot password */}
            <Button
              title="Continue"
              onPress={handleLogin}
              isLoading={isLoading}
              classStyle="mb-8"
            />

            <View className="py-2 w-full items-center justify-center mb-8 flex-row flex-1">
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
