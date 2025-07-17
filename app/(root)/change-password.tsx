import { View, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { postAPI } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { ZodChecker } from '@/utils';
import { Card } from '@/components/ui/Card';

const ChangePassword = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [reNewPwd, setReNewPwd] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlChangePassword = async () => {
    // Simple validation
    if (!currentPwd.trim || !newPwd.trim || !reNewPwd.trim) {
      Toast.show({
        type: 'error',
        text1: 'All field are required',
      });
      return;
    }
    if (newPwd.trim !== reNewPwd.trim) {
      Toast.show({
        type: 'error',
        text1: 'New & Retype Password is not the same',
      });
      return;
    }

    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/changepassword`,
        {
          id: user?.id,
          currentPwd,
          newPwd,
        },
      );

      if (ZodChecker(userDataString)) {
        return;
      }
      

      //   if (userDataString.token && userDataString.user) {
      //     // Assuming userDataString is a JSON string
      //     const { token, user } = userDataString;
      //     // check if verification is not yet set
      //     if (user.otpcode) {
      //       setUserSignUpData({
      //         ...userDataString.user,
      //         phone: user.phoneNumber,
      //       });
      //       router.push('/(auth)/verify');
      //       return;
      //     }

      //     const updateData = { ...user, isLogin: true };
      //     setJWTtoken(token);
      //     setUser(updateData);
      //     router.replace('/(root)/(tabs)');
      //   } else {
      //     Toast.show({
      //       type: 'error',
      //       text1: 'Invalid phone number or password',
      //     });
      //   }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Change Password'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className=" flex-1 mt-4">
          <Text
            style={{
              color: colors.text,
            }}
            className="text-sm mb-8"
          >
            You can change your password here, enter your current password to
            validate, then enter your new password and click Save
          </Text>
          <Card>
          <Input
            label="Current Password"
            value={currentPwd}
            onChangeText={setCurrentPwd}
            placeholder="Password"
            secureTextEntry
            icon={
              <MaterialCommunityIcons
                name="form-textbox-password"
                size={20}
                color={colors.text + '80'}
              />
            }
            classStyle="mb-2"
          />
          <Input
            label="New Password"
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="Password"
            secureTextEntry
            icon={
              <MaterialCommunityIcons
                name="form-textbox-password"
                size={20}
                color={colors.text + '80'}
              />
            }
            classStyle="mb-2"
          />
          <Input
            label="Retyp New Password"
            value={reNewPwd}
            onChangeText={setReNewPwd}
            placeholder="Password"
            secureTextEntry
            icon={
              <MaterialCommunityIcons
                name="form-textbox-password"
                size={20}
                color={colors.text + '80'}
              />
            }
            classStyle="mb-2"
          />

          <Button
            title="Save"
            onPress={handlChangePassword}
            isLoading={isLoading}
            classStyle="my-8"
          />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;
