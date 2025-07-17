import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
} from 'react-native';
import { ReactNativeModal } from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { InputOtp } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import TitleHeader from '@/components/ui/Header';
import { maskString, ZodChecker } from '@/utils';
import { postAPI, storeLocally } from '@/utils/fetch';
import Toast from 'react-native-toast-message';
import BgLoading from '@/components/BgLoading';
import { useSignUpStore } from '@/store/useSignUpStore';
// import SpiralCheck from '@/components/ui/SpiralCheck';
import ModalConfirm from '@/components/ui/ModalConfirm';

export default function VerifyScreen() {
  const { setUser, setJWTtoken, setIsLoginAuth } = useAuthStore();
  const { setUserSignUpData, userSignUpData } = useSignUpStore();

  const { colors } = useThemeStore();
  const router = useRouter();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enableBtn, setEnableBtn] = useState(true);
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');
  const [code4, setCode4] = useState('');
  const [code5, setCode5] = useState('');
  const code1Input = React.useRef<TextInput>(null);
  const code2Input = React.useRef<TextInput>(null);
  const code3Input = React.useRef<TextInput>(null);
  const code4Input = React.useRef<TextInput>(null);
  const code5Input = React.useRef<TextInput>(null);

  useEffect(() => {
    if (code1 && code2 && code3 && code4 && code5) {
      setEnableBtn(false);
    } else {
      setEnableBtn(true);
    }
  }, [code1, code2, code3, code4, code5]);

  useEffect(() => {
    // Check if user is authenticated
    const checkLocalUser = async () => {
      if (!userSignUpData) {
        router.replace('/(auth)');
      }
    };
    checkLocalUser();
  }, []);

  if (!userSignUpData) {
    return <BgLoading />;
  }

  const setCode = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    switch (field) {
      case 'code1':
        setCode1(numericValue);
        if (numericValue && code2Input.current) code2Input.current.focus();

        break;
      case 'code2':
        setCode2(numericValue);
        if (numericValue && code3Input.current) code3Input.current.focus();
        if (!numericValue) {
          code1Input.current?.focus();
        }
        break;
      case 'code3':
        setCode3(numericValue);
        if (numericValue && code4Input.current) code4Input.current.focus();
        if (!numericValue) {
          code2Input.current?.focus();
        }
        break;
      case 'code4':
        setCode4(numericValue);
        if (numericValue && code5Input.current) code5Input.current.focus();
        if (!numericValue) {
          code3Input.current?.focus();
        }
        break;

      case 'code5':
        setCode5(numericValue);
        if (!numericValue) {
          code4Input.current?.focus();
        }
        break;
    }
  };

  const handleResend = async () => {
    // stimulate sending out email
    // use email and code and send out again
    try {
      setIsLoading(true);
      // Mock API call delay
      const response = await postAPI('/api/auth/resend-otp', {
        phoneNumber: userSignUpData?.phone,
        email: userSignUpData?.email,
        firstname: userSignUpData?.firstname,
      });

      if (response.error) {
        Toast.show({
          type: 'error',
          text1: response.error,
        });
        return;
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'A new OTP has been sent.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to resend OTP. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to resend OTP. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Simple validation
    if (
      !code1.trim() ||
      !code2.trim() ||
      !code3.trim() ||
      !code4.trim() ||
      !code5.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'OTP Code is required',
      });
      return;
    }

    const code = `${code1}${code2}${code3}${code4}${code5}`;

    try {
      setIsLoading(true);
      Keyboard.dismiss();
      // Mock API call delay
      const userDataString = await postAPI('/api/auth/verify', {
        phoneNumber: userSignUpData?.phone,
        otpcode: code,
      });

      if (ZodChecker(userDataString)) {
        return;
      }

      if (userDataString.success === false) {
        Toast.show({
          type: 'error',
          text1: userDataString.message || 'Invalid otpcode',
        });
        return;
      }

      const { token, user } = userDataString.data;

      if (token && user) {
        const updateData = { ...user, otpcode: '' };
        // Store user data locally
        setIsLoginAuth(true);
        setJWTtoken(token);
        setUser(updateData);
        setShowSuccessModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid otpcode',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error occurred, please try again',
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
        className={`flex-1 px-2 py-3 items-center`}
      >
        {/* Header */}
        <View className="mb-6 items-center">
          <Text
            style={{ color: colors.primary }}
            className={`text-2xl mb-2 font-['Poppins-Bold']`}
          >
            Verification Code
          </Text>
          <Text
            style={{ color: colors.gray }}
            className="text-sm text-center px-5 font-['Inter-Regular']"
          >
            We have sent a verification code to
          </Text>
          <Text className="text-2xl text-blue-700 font-bold text-center my-3">
            {maskString(`${userSignUpData?.phone}`, 3, 9)}
          </Text>
          <Text className="text-xs text-red-400">
            Please check your SMS or Email address
          </Text>
        </View>

        {/* Form Card */}
        <View className=" items-center py-3 rounded-2xl flex-1 w-full max-w-md mt-10  px-4">
          <View className="mb-2 flex-row gap-2 ">
            <InputOtp
              ref={code1Input}
              borderColor="#ccc"
              value={code1}
              onChangeText={(text) => setCode('code1', text)}
              maxLength={1}
            />

            <InputOtp
              ref={code2Input}
              borderColor="#ccc"
              value={code2}
              onChangeText={(text) => setCode('code2', text)}
              maxLength={1}
            />

            <InputOtp
              ref={code3Input}
              borderColor="#ccc"
              value={code3}
              onChangeText={(text) => setCode('code3', text)}
              maxLength={1}
            />

            <InputOtp
              ref={code4Input}
              borderColor="#ccc"
              value={code4}
              onChangeText={(text) => setCode('code4', text)}
              maxLength={1}
            />

            <InputOtp
              ref={code5Input}
              borderColor="#ccc"
              value={code5}
              onChangeText={(text) => setCode('code5', text)}
              maxLength={1}
            />
          </View>

          <View className="flex-row justify-center items-center">
            <Text
              style={{ color: colors.text + '80' }}
              className="text-sm mr-1 font-['Inter-Regular']"
            >
              Didnt receive verification code?
            </Text>

            <TouchableOpacity onPress={handleResend}>
              <Text
                style={{ color: colors.primary }}
                className="text-md font-bold font-['Inter-SemiBold']"
              >
                Resend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="justify-center items-center bottom-2 absolute w-full">
            <Button
              title="Verify"
              onPress={handleLogin}
              isLoading={isLoading}
              classStyle="w-full"
              disabled={enableBtn}
            />
          </View>
        </View>
        <ModalConfirm
          title="Verified"
          subtitle="You have successfully verified your account."
          showSuccessModal={showSuccessModal}
          btnReact={
            <Button
              title="Browse Dashboard"
              onPress={() => {
                setUserSignUpData(null);
                router.replace('/(root)/(tabs)');
              }}
              classStyle="mt-5"
            />
          }
        />
        {/* {showSuccessModal && (
          <View className="top-0 left-0 right-0 bottom-0 absolute bg-black/60 z-50">
            <ReactNativeModal isVisible={showSuccessModal}>
              <View
                style={{
                  backgroundColor: colors.background,
                }}
                className=" px-7 py-9 rounded-2xl min-h-[300px] w-[90%]"
              >
                <SpiralCheck />

                <Text
                  style={{ color: colors.text }}
                  className="text-2xl font-['Inter-Bold'] text-center"
                >
                  Verified
                </Text>
                <Text
                  style={{ color: colors.gray }}
                  className="text-base font-['Inter-Regular'] text-center mt-2"
                >
                  You have successfully verified your account.
                </Text>
                <Button
                  title="Browse Dashboard"
                  onPress={() => {
                    router.replace('/(root)/(tabs)');
                    setUserSignUpData(null);
                  }}
                  classStyle="mt-5"
                />
              </View>
            </ReactNativeModal>
          </View>
        )} */}
      </View>
    </SafeAreaView>
  );
}
