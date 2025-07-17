import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
// import { useOAuth } from '@clerk/clerk-expo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
// import { useClerkAuth } from '@/hooks/useClerkAuth';
import { useThemeStore } from '@/store/useThemeStore';
import { AntDesign, Feather } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { postAPI } from '@/utils/fetch';
import Toast from 'react-native-toast-message';
import { loginAccess, ZodChecker } from '@/utils';
import { useSignUpStore } from '@/store/useSignUpStore';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { AuthErrorMessage } from '@/components/auth/AuthErrorMessage';
import { LoadingOverlay } from '@/components/auth/LoadingOverlay';
import { SocialAuthProvider } from '@/types/auth';
import * as WebBrowser from 'expo-web-browser';
import OAuth from '@/components/OAuth';
import tw from 'twrnc';

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

const socialProviders: SocialAuthProvider[] = [
  {
    name: 'google',
    displayName: 'Google',
    icon: '🔍',
    color: '#1F2937',
    bgColor: '#FFFFFF',
  },
  {
    name: 'facebook',
    displayName: 'Facebook',
    icon: '📘',
    color: '#FFFFFF',
    bgColor: '#1877F2',
  },
  {
    name: 'apple',
    displayName: 'Apple',
    icon: '🍎',
    color: '#FFFFFF',
    bgColor: '#000000',
  },
];

export default function LoginScreen() {
  const { setUser, setJWTtoken, setIsLoginAuth, user , isLoginAuth} = useAuthStore();
  const { setUserSignUpData } = useSignUpStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  
  // // Clerk OAuth hooks
  // const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  // const { startOAuthFlow: facebookAuth } = useOAuth({ strategy: 'oauth_facebook' });
  // const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });
  
  // Custom auth hook
  // const { isLoaded, isSignedIn, user, error, setError } = useClerkAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Redirect if already signed in
  useEffect(() => {
    if (isLoginAuth) {
      router.replace('/(root)/(tabs)');
    }
  }, [user, router, isLoginAuth]);

  //  useEffect(() => {
  //   if (isLoaded && isSignedIn && user) {
  //     router.replace('/(root)/(tabs)');
  //   }
  // }, [isLoaded, isSignedIn, user, router]);

  const handleSocialAuth = async (provider: SocialAuthProvider) => {
    // if (!isLoaded) return;
    
    setSocialLoading(provider.name);
    // setError(null);

    try {
      let startOAuthFlow;
      
      switch (provider.name) {
        case 'google':
          // startOAuthFlow = googleAuth;
          break;
        case 'facebook':
          // startOAuthFlow = facebookAuth;
          break;
        case 'apple':
          // startOAuthFlow = appleAuth;
          break;
        default:
          throw new Error('Unsupported provider');
      }

      // const { createdSessionId, setActive } = await startOAuthFlow();

      // if (createdSessionId) {
      //   // await setActive({ session: createdSessionId });
        
      //   Toast.show({
      //     type: 'success',
      //     text1: `Successfully signed in with ${provider.displayName}!`,
      //   });
        
      //   router.replace('/(root)/(tabs)');
      // }
    } catch (err: any) {
      console.error(`${provider.displayName} OAuth error:`, err);
      
      let errorMessage = `Failed to sign in with ${provider.displayName}`;
      
      if (err.errors && err.errors[0]) {
        errorMessage = err.errors[0].longMessage || err.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // setError(errorMessage);
      
      Toast.show({
        type: 'error',
        text1: errorMessage,
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLogin = async () => {
    
    setIsLoading(true);
    try {
      await loginAccess(
        phoneNumber, 
        password,
        setJWTtoken,
        setUser,
        setUserSignUpData
      );
    } catch (error) {
      console.error('Login error:', error);
      // setError('Invalid phone number or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
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
          <View className="mb-3 items-center">
            <Image
              source={require('@/assets/images/logo.png')}
              resizeMode="contain"
              style={tw`w-[28] h-[28] rounded-2xl`}
            />
            <Text
              style={{ color: colors.primary }}
              className={`text-2xl mb-1 font-['Poppins-Bold']`}
            >
              Welcome Back
            </Text>
            <Text
              style={{ color: colors.gray }}
              className="text-sm text-center px-5 font-['Inter-Regular']"
            >
              Sign in to your account to continue
            </Text>
          </View>

          {/* Form Card */}
          <View className="p-2 py-3 rounded-2xl shadow-md border-slate-200 border flex-1 w-full max-w-md mt-10">
            <View className="mb-2 ">
              <Input
                label=""
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                maxLength={11}
                autoCapitalize="none"
                icon={
                  <Feather name="phone" size={20} color={colors.text + '80'} />
                }
              />

              <Input
                label=""
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
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

            {/* forgot password */}
            <View className="justify-between">
              <TouchableOpacity
                className="self-start mb-6"
                onPress={() => router.push('/(auth)/reset-password')}
              >
                <Text className="text-sm font-semibold text-primary-900">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
            <Button
              title="Log In"
              onPress={handleLogin}
              isLoading={isLoading}
              icon={<AntDesign name="user" size={20} color="#FFFFFF" />}
            />

            <OAuth />

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text
                style={{ color: colors.text + '80' }}
                className="text-sm mr-1 font-['Inter-Regular']"
              >
                Don't have an account?
              </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text
                    style={{ color: colors.primary }}
                    className="text-base font-semibold font-['Inter-SemiBold']"
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Inter-Regular',
  },
  socialSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  formCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Inter-Regular',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});