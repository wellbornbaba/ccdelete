import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import AvatarWithStatus from './ui/AvatarWithStatus';
import CardProfilePill from './ui/CardProfilePill';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { bgPrimarColor } from '@/utils/colors';
import { maskString } from '@/utils';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/useThemeStore';
import BgLoading from './BgLoading';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import KYCard from './ui/KYCard';

const ProfilePassenger = () => {
  const colors = useThemeStore((state) => state.colors);
  const currentUser = useAuthStore((state) => state.user);
  const userProfileData = useProfileStore((state) => state.userProfileData);

  const user = userProfileData ? userProfileData : currentUser;
  useEffect(() => {
    if (!user) router.back();
  }, []);

  if (!user) return <BgLoading popup={true} />;
  const KYCStatus = user.kycScore?.status || 'unverified';

  const fullAdddress = `${user.street}, ${user.city}, ${user.state}`;

  return (
    <View className="flex my-6 gap-4">
      <View className="justify-center items-center">
        <AvatarWithStatus
          photoURL={`${user.photoURL}`}
          fullname={`${user.firstName} ${user.lastName}`}
          size={82}
          status={KYCStatus}
          statusStyle={{ right: -32 }}
        />

        <View className="justify-center items-center">
          <View className="flex-row">
            <Text
              style={{
                color: colors.text,
              }}
              className="text-lg capitalize font-['Inter-SemiBold']"
            >
              {`${user.firstName} ${user.lastName}`}
            </Text>
          </View>

          <Text className="capitalize text-bgDefault font-semibold text-sm">
            {user.accountType}
          </Text>
        </View>
      </View>

      <KYCard user={user} />

      <View className="mt-8 bg-gray-100 rounded-2xl p-5">
        <Text
          style={{
            color: colors.text,
          }}
          className="text-lg font-['Inter-Bold'] mb-2 "
        >
          Personal Details
        </Text>
        <View className="mt-2 gap-1">
          <CardProfilePill
            title={'Phone'}
            subtitle={user.phoneNumber}
            icon={<Feather name="phone" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Gender'}
            subtitle={user.gender || 'Unknow'}
            icon={<Feather name="user" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Email'}
            subtitle={user.email ? maskString(user.email, 4, 14) : 'Nill'}
            icon={<Feather name="mail" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Home Address'}
            subtitle={user.street ? maskString(fullAdddress, 1, 5) : 'Nil'}
            icon={<Feather name="map-pin" size={18} color={bgPrimarColor} />}
          />
        </View>
      </View>

      <View className=" bg-bgColor rounded-2xl p-5 ">
        <Text
          style={{
            color: colors.text,
          }}
          className="text-lg font-['Inter-Bold'] mb-2 "
        >
          KYC Documents
        </Text>
        <View className="mt-2 gap-1">
          <CardProfilePill
            subtitle={'Government Document'}
            icon={
              <Ionicons name="document-text" size={18} color={bgPrimarColor} />
            }
            righticon={
              <View className="flex-row rounded-full items-center justify-between bg-gray-50 p-1">
                {user.kycScore?.kyc?.government_id.isVerified ? (
                  <View className="gap-2 flex-row">
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={bgPrimarColor}
                    />
                    <Text className="text-xs text-bgDefault">Verified</Text>
                  </View>
                ) : (
                  <View className="gap-2 flex-row">
                    <AntDesign name="warning" size={13} color={'red'} />
                    <Text className="text-xs text-red-800">Unverify</Text>
                  </View>
                )}
              </View>
            }
          />

          <CardProfilePill
            subtitle={'Proof Of Address'}
            icon={
              <Ionicons name="document-text" size={18} color={bgPrimarColor} />
            }
            righticon={
              <View className="flex-row rounded-full items-center justify-between bg-gray-50 p-1">
                {user.kycScore?.kyc?.proof_address.isVerified ? (
                  <View className="gap-2 flex-row">
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={bgPrimarColor}
                    />
                    <Text className="text-xs text-bgDefault">Verified</Text>
                  </View>
                ) : (
                  <View className="gap-2 flex-row">
                    <AntDesign name="warning" size={13} color={'red'} />
                    <Text className="text-xs text-red-800">Unverify</Text>
                  </View>
                )}
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};

export default ProfilePassenger;
