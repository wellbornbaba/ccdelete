import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { useThemeStore } from '@/store/useThemeStore';
import { AntDesign, EvilIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { User } from '@/types';
import { formatLocation, UpdateLocation, Wordstruncate } from '@/utils';
import { Avatar } from './Avatar';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BASEURL } from '@/utils/fetch';
import AvatarWithStatus from './AvatarWithStatus';

interface HeaderProps {
  left?: React.ReactNode;
  title?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: boolean;
}

const TitleHeader: React.FC<HeaderProps> = ({ left, title, right, onBack }) => {
  const { colors } = useThemeStore();

  return (
    <View
      style={{ backgroundColor: colors.background }}
      className="flex-row items-center px-4 py-1 "
    >
      {/* Left side (Back or custom left) */}
      <View className="flex-row items-center">
        {onBack && (
          <Pressable onPress={() => router.back()} className="p-2 mr-10">
            <AntDesign name="arrowleft" size={22} color={colors.gray} />
          </Pressable>
        )}
        {left}
      </View>

      {/* Title (centered text) */}
      <View className="items-center flex-row justify-between">
        {title && (
          <Text className="text-xl font-bold" style={{ color: colors.primary }}>
            {title}
          </Text>
        )}
        {/* Right side */}
        {right && <View className="items-end">{right}</View>}
      </View>
    </View>
  );
};

export const DashboardHeader = ({
  userData,
  rightElement,
  pullToRefresh = false,
  setPullToRefresh,
}: {
  userData: User | null;
  rightElement?: ReactNode;
  pullToRefresh?: boolean;
  setPullToRefresh?: (value: boolean) => void;
}) => {
  const { colors } = useThemeStore();
  const JWTtoken = useAuthStore((state) => state.JWTtoken);
  const companyInfo = useAuthStore((state) => state.companyDatas);
  const setUserProfileData = useProfileStore(
    (state) => state.setUserProfileData,
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState('Unknown');

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    // const interval = setInterval(async () => {
    const runUpdateLocation = async () => {
      try {
        setLoadingLocation(true);
        const updatedLocation = await UpdateLocation(
          userData,
          userData?.userLocations,
          JWTtoken,
          companyInfo?.driver_fee_mile || 100,
        );
        setLocationAddress(
          formatLocation(updatedLocation?.address || 'Unkwon'),
        ); // update for next comparison
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingLocation(false);
      }
    };
    // }, 120 * 1000); // every 60 seconds
    // return () => clearInterval(interval);
    if (!pullToRefresh) {
      runUpdateLocation();
      setPullToRefresh && setPullToRefresh(true);
    }
  }, [pullToRefresh, setPullToRefresh]);

  return (
    <View className="flex-row justify-between items-center my-2">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => {
            router.push('/(root)/profile');
            setUserProfileData(null);
          }}
        >
          <Avatar
            source={`${userData?.photoURL}`}
            name={`${userData?.firstName} ${userData?.lastName}`}
            size={42}
          />
        </TouchableOpacity>

        <View>
          <View className="flex-row items-center">
            <Text
              style={{
                color: colors.text,
              }}
              className="text-md "
            >
              {getGreeting()}
              {': '}
            </Text>
            <Text className="font-bold">{userData?.firstName}</Text>
            {userData?.kycScore?.status === 'verified' && (
              <AvatarWithStatus
                photoURL={`${userData?.photoURL}`}
                fullname={`${userData?.firstName} ${userData?.lastName}`}
                size={15}
                status={userData.kycScore.status}
                iconOnly={true}
                statusStyle={{ marginLeft: 4 }}
              />
            )}
          </View>

          <View className="flex-row items-center my-1">
            <Feather
              name="map-pin"
              size={12}
              color={colors.gray}
              style={{
                paddingRight: 3,
              }}
            />
            <Text
              style={{
                color: colors.text,
              }}
              className=" text-xs opacity-90 font-inter-regular text-wrap"
            >
              {/* {loadingLocation
                ? 'Detecting location...'
                : Wordstruncate(formatLocation(locationAddress), 35, '...')} */}
              {userData?.accountType === 'driver'
                ? 'Start making extra cash with your ride'
                : 'Where would you like to go'}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        {rightElement && rightElement}
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          className=" rounded-full bg-green-50 items-center justify-center"
        >
          <EvilIcons name="gear" size={27} color={colors.gray} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const DashboardPagesHeader = ({
  onBack,
  onBackHandle,
  leftElement,
  centerElement,
  rightElement,
}: {
  onBack?: boolean;
  onBackHandle?: () => void;
  leftElement?: ReactNode;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
}) => {
  return (
    <View className="flex-row justify-between items-center my-2">
      <View className="flex-row items-center gap-3 ">
        <View>
          {onBack && (
            <Pressable
              onPress={() => {
                onBackHandle ? onBackHandle() : router.back();
              }}
              className="p-2 mr-10"
            >
              <AntDesign name="arrowleft" size={22} color={'#076572'} />
            </Pressable>
          )}
          {leftElement}
        </View>

        <View>
          {centerElement && (
            <Text className="text-bgDefault text-xl font-['Inter-SemiBold'] text-center ">
              {centerElement}
            </Text>
          )}
        </View>
      </View>
      <View>{rightElement}</View>
    </View>
  );
};

export default TitleHeader;
