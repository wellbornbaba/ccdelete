import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AvatarWithStatus from './ui/AvatarWithStatus';
import { NAIRA, postAPI } from '@/utils/fetch';
import {
  formatCurrency,
  formatDateHuman,
  formatTime,
  getRemainingMinutes,
  Wordstruncate,
} from '@/utils';
import { bgPrimarColor, lightPrimaryColor } from '@/utils/colors';
import { router } from 'expo-router';
import { useRideStore } from '@/store/useRideStore';
import DriverCarCard from './ui/DriverCarCard';
import { useThemeStore } from '@/store/useThemeStore';
import { useProfileStore } from '@/store/useProfileStore';
import Toast from 'react-native-toast-message';
import { openURL } from 'expo-linking';
import { useChatStore } from '@/store/useChatStore';
import { JoinDataProps, Ride, RideRequest } from '@/types/vehicle';
import BgLoading from './BgLoading';
import StatusBadge from './ui/StatusBadge';
import { User, UserBasic } from '@/types';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from './ui/Button';

const RideRequestResullt = ({
  item,
  handlePayment,
}: {
  item: RideRequest;
  handlePayment: () => void;
}) => {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const JWTtoken = useAuthStore((s) => s.JWTtoken);


  const {
    setSelectedRide,
    rideActiveDetail,
    selectRide,
    setRideSearchSelectedData,
  } = useRideStore();
  const setUserProfileData = useProfileStore((s) => s.setUserProfileData);
  const { setChatUser } = useChatStore();
  const [isExpired, setIsExpired] = useState(false);
  const [preview, setPreview] = useState(false);

  const ride = item;
  if (!ride) {
    return (
      <View className="flex-1 h-10">
        <BgLoading popup={true} size={'small'} />
      </View>
    );
  }

  const alreadyJoined = ride.activeUsers?.includes(user?.id ?? '');
  const [remainingMinutes, setRemainingMinutes] = useState(
    ride.awaitTimeMins || 10,
  );

  const rideInitiatorUser = item.initiatorUser || null;
  const ridePriceShare = Number(ride.shared_fare_price);
  const expireDate = new Date(ride.expiresAt);
  //   const formattedDate = format(expireDate, 'yyyy-MM-dd hh:mm:ss');

  const handleUpdate = async () => {
    if(!JWTtoken) router.replace("/(auth)/login-lock")
    try {
      await postAPI(
        `/api/ride-request/${ride?.id}/expire`,
        { status: 'expired' },
        'PATCH',
        JWTtoken || '',
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (remainingMinutes <= 0) {
      // setIsExpired(true);
      //   handleUpdate();
      return; // No need to set interval if already expired
    }
    const intervalId = setInterval(() => {
      const remainingMinute = getRemainingMinutes(expireDate);
      setRemainingMinutes(remainingMinute);
    }, 3000); // Update every second

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, [remainingMinutes]); // Only re-run if expirationMinutes changes

  const handleJoin = () => {
    if (isExpired) {
      Toast.show({
        type: 'error',
        text1: 'Oop Trip expired and called, join another ride',
      });
      return;
    }
    if (alreadyJoined) return router.navigate('/(root)/(modals)/view-ride');
    if (ride.dstatus === 'accepted') {
      setRideSearchSelectedData(ride.ride || null);
      router.push('/(root)/ride-detail');
      return;
    }
    setPreview(true);
  };

  const isPaid = false;

  const payAlert = () => {
    Toast.show({
      type: 'error',
      text1: "Sorry you've to join ride to use this features",
    });
  };

  const handleChat = () => {
    if (!alreadyJoined) {
      payAlert();
    } else {
    //     const userChatInfor: UserBasic = {
    //          id: ride.ride?.id,
    //           email: ride.ride?.ride.driver?.email,
    //           firstName?: ride.ride?.firstName,
    //           lastName?: ride.ride?.lastName,
    //           phoneNumber?: ride.ride?.phoneNumber,
    //           accountType?: ride.ride?.phoneNumber,
    //           photoURL?: ride.ride?.email,
    //           kycScore?: ride.ride?.phoneNumber,
    //           isAvaliable?: ride.ride?.phoneNumber,
    //           verified?: ride.ride?.phoneNumber,
    //           walletBalance?: ride.ride?.phoneNumber,
    //           earnings?: ride.ride?.phoneNumber,
    //           totalRides?: ride.ride?.phoneNumber,
    //         }
    //     }
    //   setChatUser(ride?.ride || null);
      router.navigate('/(root)/chat');
    }
  };

  const handleCall = () => {
    payAlert();

    // ride?.driver ? openURL(`tel:${ride.driver.phoneNumber}`) : null;
  };

  return (
    <View className={'py-2 bg-dimColorGray rounded-lg flex-1'}>
      {/* Header row */}
      <TouchableOpacity
        className="flex-row items-start flex-1 "
        onPress={() => {
          router.navigate('/(root)/profile');
          setUserProfileData(rideInitiatorUser);
        }}
      >
        <AvatarWithStatus
          photoURL={`${rideInitiatorUser?.photoURL}`}
          fullname={`${rideInitiatorUser?.firstName} ${rideInitiatorUser?.lastName}`}
          size={70}
          status={rideInitiatorUser?.kycScore?.status || 'unverified'}
          statusStyle={{ right: -40, bottom: -3 }}
        />

        <View className="ml-2 flex-1">
          <View className="">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold mr-1 capitalize ">
                {Wordstruncate(
                  `${rideInitiatorUser?.firstName} ${rideInitiatorUser?.lastName}`,
                  22,
                )}
              </Text>
              <Ionicons name="car-outline" size={15} color={bgPrimarColor} />
            </View>
            <Text className="text-xs text-gray-500">
              {rideInitiatorUser?.driver?.model} • 
              {rideInitiatorUser?.driver?.interior_color} • 
              {rideInitiatorUser?.driver?.plate_number}
            </Text>
          </View>

          <View className="flex-row justify-between items-center ">
            <View className="flex-row gap-2">
              <Text
                style={{ color: bgPrimarColor }}
                className="text-xs uppercase self-end"
              >
                {rideInitiatorUser?.accountType}
              </Text>
              <View className="flex-row">
                {rideInitiatorUser?.driverStatistic?.starDistribution &&
                  rideInitiatorUser?.driverStatistic.starDistribution.map(
                    (item, _index) => (
                      <Feather
                        key={_index}
                        name="star"
                        size={14}
                        color={item.star <= item.count ? '#FFD700' : '#E0E0E0'}
                        style={{ marginLeft: 2 }}
                      />
                    ),
                  )}
              </View>
            </View>
            {/* <StatusBadge status={ride.dstatus} /> */}
          </View>
        </View>
      </TouchableOpacity>

      {/* Location */}
      <View className="mt-5 gap-1 ">
        <View className="flex-row items-start gap-2 mb-0">
          <View className="w-6 items-center">
            <Ionicons name="location-outline" size={22} color="#9ca3af" />
            <View
              style={{ backgroundColor: colors.border }}
              className="w-0.5 h-3 my-0.5"
            />
          </View>
          <View className="">
            <Text
              className="text-xs text-gray-500"
              style={{ color: colors.text + '80' }}
            >
              From
            </Text>
            <Text
              className="text-sm text-gray-700 font-medium capitalize"
              style={{ color: colors.text }}
            >
              {ride.pickup_address}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start gap-2 ">
          <Ionicons name="location" size={22} color={'#fca5a5'} />
          <View className="">
            <Text
              className="text-xs text-gray-500"
              style={{ color: colors.text + '80' }}
            >
              To
            </Text>
            <Text
              className="text-sm text-gray-700 font-medium capitalize"
              style={{ color: colors.text }}
            >
              {ride.dest_address}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start gap-2">
          <Ionicons name="location" size={22} color={lightPrimaryColor + 90} />
          <View className="">
            <Text
              className="text-xs text-gray-500"
              style={{ color: colors.text + '80' }}
            >
              Pickup Point
            </Text>
            <Text
              className="text-sm text-gray-700 font-medium capitalize"
              style={{ color: colors.text }}
            >
              {ride.pickup_address ? ride.pickup_address : ride.current_address}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center mt-3 mb-2">
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons
            name="seat-passenger"
            size={18}
            color={lightPrimaryColor}
          />
          <Text className="text-sm text-gray-400 font-semibold">
            {ride.seat_remain || 0}/{ride.seats} seats taken
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Feather name="clock" size={16} color={lightPrimaryColor} />
          <Text className="text-sm text-gray-400">
            {ride.awaitTimeMins ? formatTime(remainingMinutes) : 'N/A'}
          </Text>
        </View>
        {!preview && (
          <Text className="text-lg font-['Inter-SemiBold'] text-primary-900">
            {NAIRA}
            {formatCurrency(ridePriceShare)}
          </Text>
        )}
      </View>

      <View className="flex-row justify-between gap-2 items-center">
        <Pressable
          onPress={handleCall}
          className="flex-1 justify-center items-center py-1 border border-primary-900 rounded-md flex-row gap-1"
        >
          <Feather name="phone" size={12} color={lightPrimaryColor} />
          <Text className="text-sm text-gray-700 mt-1">Call</Text>
        </Pressable>
        <Pressable
          onPress={handleChat}
          className="flex-1 justify-center items-center py-1 border border-primary-900 rounded-md flex-row gap-1"
        >
          <Feather name="message-circle" size={12} color={lightPrimaryColor} />
          <Text className="text-sm text-gray-700 mt-1">Chat</Text>
        </Pressable>
        {!preview && (
          <>
            {/* <Pressable
            onPress={handleView}
            className="flex-1 justify-center items-center py-1  rounded-md flex-row gap-1 border border-primary-900"
          >
            <Feather name="eye" size={12} color={lightPrimaryColor} />
            <Text className="text-sm text-gray-700 mt-1">View</Text>
          </Pressable> */}

            <Pressable
              onPress={handleJoin}
              className={`flex-1 justify-center items-center py-1 ${isExpired ? 'bg-red-600' : 'bg-primary-900'} rounded-md flex-row gap-1`}
            >
              <Feather name="check" size={12} color="#fff" />
              <Text className="text-sm text-white mt-1">
                {ride.dstatus === 'accepted' && alreadyJoined
                  ? 'Track Trip'
                  : isExpired
                    ? 'Expired'
                    : 'Join Ride'}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {preview && (
        <View className="gap-3 mt-3">
          <View className="flex-row justify-between items-center px-2">
            <Text className="text-md text-gray-500">Main Price</Text>
            <Text className="text-red-600 font-bold text-xs self-end">
              {NAIRA}
              {formatCurrency(Number(ride.principal_ride_fee))}
            </Text>
          </View>

          <View className="flex-row justify-between items-center px-2">
            <Text className="text-md text-gray-500">You pay</Text>
            <Text className="font-['Inter-SemiBold'] text-primary-900 text-lg self-end">
              {NAIRA}
              {formatCurrency(ridePriceShare)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center px-2">
            <Text className="text-md text-gray-500">You save</Text>
            <Text className="text-red-400 font-bold text-xs self-end">
              {'-'}
              {NAIRA}
              {formatCurrency(Number(ride.principal_ride_fee) - ridePriceShare)}
            </Text>
          </View>

          <View className="flex-row w-full flex-1 justify-center items-center">
            <DriverCarCard
              title="Front Rear"
              pic={rideInitiatorUser?.driver?.front_car_url || ''}
              type="front"
            />
            <DriverCarCard
              title="Back Rear"
              pic={rideInitiatorUser?.driver?.back_car_url || ''}
              type="back"
            />
          </View>
          {/* <Pressable
            onPress={handlePayment}
            className={`flex-1 justify-center items-center py-1bg-primary-900 rounded-md flex-row gap-1 my-4`}
          >
            <Feather name="check" size={12} color="#fff" />
            <Text className="text-sm text-white mt-1">
             Pay to join Now
            </Text>
          </Pressable> */}
          <Button 
            title='Pay & Join Now'
            onPress={handlePayment}
            icon={<Feather name="check" size={12} color="#fff" />}

          />
        </View>
      )}
    </View>
  );
};

export default RideRequestResullt;
