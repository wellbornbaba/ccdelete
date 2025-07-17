import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SwitchToggle from '@/components/ui/SwitchToggle';
import { useThemeStore } from '@/store/useThemeStore';
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { accountTypeProps, User } from '@/types';
import { postAPI } from '@/utils/fetch';
import Toast from 'react-native-toast-message';
import OAuth from '@/components/OAuth';
import { ZodChecker } from '@/utils';
import { useSignUpStore } from '@/store/useSignUpStore';

interface SignuserProp extends User {
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const { setUserSignUpData } = useSignUpStore();
  const { colors } = useThemeStore();
  const router = useRouter();

  const [accountTypeSelector, setAccountTypeSelector] =
    useState<accountTypeProps>('passenger');
  const [agreement, setAgreement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<SignuserProp>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    accountType: accountTypeSelector,
  });

  const handleSignup = async () => {
    // Simple validation
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      accountType,
    } = formData as SignuserProp;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !phoneNumber.trim() ||
      !accountType
    ) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all fields',
      });
      return;
    }

    // count phone number length
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length !== 11) {
      Toast.show({
        type: 'error',
        text1: 'Phone number must be 11 digits',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      });

      return;
    }
    if (!agreement) {
      Toast.show({
        type: 'error',
        text1: 'You must agree to the terms and conditions',
      });

      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss();

      // Mock API call delay
      const userFormData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        accountType: accountTypeSelector,
      };

      const userDataString = await postAPI('/api/auth/register', userFormData);
      if(ZodChecker(userDataString)){
        return;
      }

      if (userDataString.success) {
        const  user = userDataString.data
        // Assuming userDataString is a JSON string
        setUserSignUpData(user)
        Toast.show({
          type: 'success',
          text1: "Congrats!!! you're almost done",
        });

        router.push('/(auth)/verify');
        return;

      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong, try again later',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to create account, please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView className="flex-1">
      <View
        style={{ backgroundColor: colors.background }}
        className={`flex-1 px-2 py-3`}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 16,
              alignItems: 'center',
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="mb-1 items-center">
              {/* <Image
                source={require('@/assets/images/logo.png')}
                resizeMode="contain"
                style={tw`w-[28] h-[28] rounded-2xl`}
              /> */}
              <Text
                style={{ color: colors.primary }}
                className={`text-2xl mb-1 font-['Poppins-Bold']`}
              >
                Create Account
              </Text>
              <Text
                style={{ color: colors.gray }}
                className="text-sm text-center px-5 font-['Inter-Regular']"
              >
                Sign up to start sharing rides
              </Text>
            </View>

            <View className="p-2 py-1 rounded-2xl shadow-md border-slate-200 border flex-1 w-full max-w-md mt-10">
              {/* {error && (
                <View
                  style={{ backgroundColor: colors.error + '20' }}
                  className="p-3 rounded-lg mb-4"
                >
                  <Text
                    style={{ color: colors.error }}
                    className="text-sm font-medium"
                  >
                    {error}
                  </Text>
                </View>
              )} */}

              <View className="mb-2 ">
                <SwitchToggle
                  label="I am signing up as"
                  value={accountTypeSelector}
                  onChange={setAccountTypeSelector}
                />

                <Input
                  label=""
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  placeholder="First name"
                  autoCapitalize="words"
                  icon={
                    <Entypo name="user" size={20} color={colors.text + '80'} />
                  }
                />

                <Input
                  label=""
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  placeholder="Last name"
                  autoCapitalize="words"
                  icon={
                    <Entypo name="user" size={20} color={colors.text + '80'} />
                  }
                />

                <Input
                  label=""
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={
                    <Feather name="mail" size={20} color={colors.text + '80'} />
                  }
                />

                <Input
                  label=""
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleChange('phoneNumber', text)}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  icon={
                    <Feather
                      name="phone"
                      size={20}
                      color={colors.text + '80'}
                    />
                  }
                  maxLength={11}
                />

                <Input
                  label=""
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                  placeholder="Create a password"
                  secureTextEntry
                  icon={
                    <MaterialCommunityIcons
                      name="form-textbox-password"
                      size={20}
                      color={colors.text + '80'}
                    />
                  }
                />

                <Input
                  label=""
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                  placeholder="Confirm your password"
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
              <View className="flex-row mb-6 mt-2">
                <Switch value={agreement} onValueChange={setAgreement} />
                <View className="text-wrap ml-2">
                  <Text
                    style={{ color: colors.gray }}
                    className={`text-md font-['Inter-Regular']`}
                  >
                    By signing up, you agree to our 
                  </Text>

                  <View className="text-wrap flex-row ">
                    <Link href="/(auth)/terms" asChild>
                      <TouchableOpacity>
                        <Text
                          style={{ color: colors.primary }}
                          className={`text-md font-['Inter-SemiBold']`}
                        >
                          Terms of Service
                        </Text>
                      </TouchableOpacity>
                    </Link>
                    <Text
                      style={{ color: colors.gray }}
                      className={`text-md font-['Inter-Regular']`}
                    > and
                    </Text>
                    <Link href="/(auth)/privacy" asChild>
                      <TouchableOpacity>
                        <Text
                          style={{ color: colors.primary }}
                          className={`text-md font-['Inter-SemiBold']`}
                        >
                          Privacy Policy
                        </Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleSignup}
                isLoading={isLoading}
                icon={<Entypo name="add-user" size={20} color="#FFFFFF" />}
              />

              <OAuth />

              <View className="flex-row justify-center items-center mb-5">
                <Text
                  style={{ color: colors.text + '80' }}
                  className="text-sm mr-1 font-['Inter-Regular']"
                >
                  Already have an account?
                </Text>
                <Link href="/(auth)" asChild>
                  <TouchableOpacity>
                    <Text
                      style={{ color: colors.primary }}
                      className="text-base font-semibold font-['Inter-SemiBold']"
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
