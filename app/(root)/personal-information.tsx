import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { Feather, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { BASEURL } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { requestPermissions, ZodChecker } from '@/utils';
import { Card } from '@/components/ui/Card';
import { router } from 'expo-router';
import AvatarWithStatus from '@/components/ui/AvatarWithStatus';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { bgPrimarColor } from '@/utils/colors';
import { SelectField } from '@/components/ui/SelectField';

const PersonalInformation = () => {
  const colors = useThemeStore((state) => state.colors);
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [fileSet, setfileSet] = useState('');
  const [fileImage, setfileImage] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    street: user?.street || '',
    city: user?.city || '',
    gender: user?.gender || '',
    state: user?.state || '',
    country: user?.country || '',
  });
  const KYCStatus = user?.kycScore?.status || 'unverified';
  const apilink = `${BASEURL}/api/uploads/profile`;

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);

      const param: Record<string, string> = {
        userid: String(user?.id),
        ...formData,
      };

      const res = await FileSystem.uploadAsync(apilink, fileSet, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'uploadfile',
        parameters: param,
      });
      const jsonResponse = JSON.parse(res.body);
      if (ZodChecker(jsonResponse)) {
        return;
      }

      if (!jsonResponse.success) {
        Toast.show({
          type: 'error',
          text1: jsonResponse.message,
        });
        return;
      }
      // const userProfile = {
      //   ...user,
      //   email: formData.email,
      //   photoURL: fileImage,
      // };
      setUser(jsonResponse.data);

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    if (!(await requestPermissions())) return;

    const mediaFILE = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (
      !mediaFILE.canceled &&
      mediaFILE.assets &&
      mediaFILE.assets.length > 0
    ) {
      setfileSet(mediaFILE.assets[0].uri);
      setfileImage(mediaFILE.assets[0].uri);
    }
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader
        onBack={true}
        centerElement={'Personal Information'}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          <Text
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text }}
          >
            Update Your Information
          </Text>

          <View className="justify-center items-center my-4">
            <TouchableOpacity onPress={pickImage}>
              <AvatarWithStatus
                photoURL={fileImage ? fileImage : `${user?.photoURL}`}
                fullname={`${user?.firstName} ${user?.lastName}`}
                size={92}
                status={KYCStatus}
                statusStyle={{ right: -44 }}
              />
              <View className="absolute top-1 -right-3">
                <MaterialCommunityIcons
                  name="image-edit-outline"
                  size={22}
                  color={bgPrimarColor}
                />
              </View>
            </TouchableOpacity>

            <View className="justify-center items-center">
              <View className="flex-row">
                <Text
                  style={{
                    color: colors.text,
                  }}
                  className="text-lg capitalize font-['Inter-SemiBold']"
                >
                  {`${user?.firstName} ${user?.lastName}`}
                </Text>
              </View>

              <Text className="capitalize text-bgDefault font-semibold text-sm">
                {user?.accountType}
              </Text>
            </View>
          </View>

          {user?.accountType === 'driver' && (
            <Card classStyle="p-4 mb-4">
              <Text
                className="text-base font-['Inter-Bold'] mb-4"
                style={{ color: colors.text }}
              >
                Driver Information
              </Text>

              <Button
                title="Update Vehicle Information"
                onPress={() => router.navigate('/(root)/driver-form')}
              />
            </Card>
          )}
          <Card classStyle="p-4 mb-4">
            <Text
              className="text-base font-['Inter-Bold'] mb-4"
              style={{ color: colors.text }}
            >
              Basic Information
            </Text>

            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              placeholder="Enter your first name"
              icon={<Entypo name="user" size={20} color={colors.text + '80'} />}
              readOnly={user?.firstName ? true : false}
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              placeholder="Enter your last name"
              icon={<Entypo name="user" size={20} color={colors.text + '80'} />}
              readOnly={user?.lastName ? true : false}
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              icon={
                <Feather name="mail" size={20} color={colors.text + '80'} />
              }
            />

            <Input
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              icon={
                <Feather name="phone" size={20} color={colors.text + '80'} />
              }
              readOnly={user?.phoneNumber ? true : false}
            />
            <SelectField
              defaultInputType={{
                label: 'Select Gender',
                value: 'none',
              }}
              inputType={[
                { label: 'Female', value: 'Female' },
                { label: 'Male', value: 'Male' },
              ]}
              selectedValue={formData.gender}
              onValueChange={(val) => handleChange('gender', String(val))}
              mode="dialog"
              className="text-2xl"
              aria-disabled={true}
              
            />
          </Card>

          <Card classStyle="p-4 mb-4">
            <Text
              className="text-base font-medium mb-4"
              style={{ color: colors.text }}
            >
              Address Information
            </Text>

            <Input
              label="Street Address"
              value={formData.street}
              onChangeText={(text) => handleChange('street', text)}
              placeholder="Enter your street address"
              icon={
                <Feather name="map-pin" size={20} color={colors.text + '80'} />
              }
              readOnly={user?.street ? true : false}
            />

            <Input
              label="City"
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
              placeholder="Enter your city"
              icon={
                <Feather name="map-pin" size={20} color={colors.text + '80'} />
              }
              readOnly={user?.city ? true : false}
            />

            <Input
              label="State"
              value={formData.state}
              onChangeText={(text) => handleChange('state', text)}
              placeholder="Enter your state"
              icon={
                <Feather name="map-pin" size={20} color={colors.text + '80'} />
              }
              readOnly={user?.state ? true : false}
            />

            <Input
              label="Country"
              value={formData.country}
              onChangeText={(text) => handleChange('country', text)}
              placeholder="Enter your country"
              icon={
                <Feather name="map-pin" size={20} color={colors.text + '80'} />
              }
              readOnly={user?.country ? true : false}
            />
          </Card>

          <Button
            title="Update Profile"
            onPress={handleUpdateProfile}
            isLoading={isLoading}
            classStyle="mt-4"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformation;
