import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AvatarWithStatus from './ui/AvatarWithStatus';
import { BASEURL, NAIRA } from '@/utils/fetch';
import { formatCurrency, formatDateHuman, Wordstruncate } from '@/utils';
import { bgPrimarColor, lightPrimaryColor } from '@/utils/colors';
import { router } from 'expo-router';
import { useRideStore } from '@/store/useRideStore';
import DriverCarCard from './ui/DriverCarCard';
import { useThemeStore } from '@/store/useThemeStore';
import { useProfileStore } from '@/store/useProfileStore';
import Toast from 'react-native-toast-message';
import { openURL } from 'expo-linking';
import { useChatStore } from '@/store/useChatStore';
import { JoinDataProps, Ride } from '@/types/vehicle';
import BgLoading from './BgLoading';
import StatusBadge from './ui/StatusBadge';

const RideResultCard = ({
  item,
  preview = false,
}: {
  item?: Ride;
  preview?: boolean;
}) => {
  const colors = useThemeStore((state) => state.colors);
  const { setSelectedRide, rideActiveDetail, selectRide, setRideDetail } =
    useRideStore();
  const setUserProfileData = useProfileStore((s) => s.setUserProfileData);
  const { setChatUser } = useChatStore();

  const ride = item ? item : rideActiveDetail;
  if (!ride) {
    return (
      <View className="flex-1 h-10">
        <BgLoading popup={true} size={'small'} />
      </View>
    );
  }

  const ridePriceShare = Number(ride.shared_fare_price);

  const handleJoin = () => {
    ride.payment_status === 'completed'
      ? router.navigate('/(root)/(modals)/view-ride')
      : setSelectedRide({
          rideData: ride,
          selectedData: selectRide?.selectedData
            ? { ...selectRide.selectedData, rideid: ride.id }
            : ({ rideid: ride.id } as JoinDataProps),
        });
    router.push('/(root)/ride-detail');
  };

  const isPaid = ride.payment_status === 'completed' ? true : false;

  const payAlert = () => {
    Toast.show({
      type: 'error',
      text1: "Sorry you've to join ride to use this features",
    });
  };

  const handleChat = () => {
    if (!isPaid && !preview) {
      payAlert();
      return;
    }
    // Set the chat user and navigate to chat
    setChatUser(ride?.user);
    router.navigate('/(root)/chat');
  };

  const handleCall = () => {
    if (!isPaid && !preview) {
      payAlert();
      return;
    }
    ride?.driver ? openURL(`tel:${ride?.user.phoneNumber}`) : null;
  };

  const handleView = () => {
    setRideDetail(ride);
    router.navigate('/(root)/ride-detail');
  };
  
  return (
    <View className={'py-2 bg-dimColorGray rounded-lg flex-1'}>
      {/* Header row */}
      <TouchableOpacity
        className="flex-row items-start flex-1 "
        onPress={() => {
          router.navigate('/(root)/profile');
          setUserProfileData(ride?.user ?? null);
        }}
      >
        <AvatarWithStatus
          photoURL={`${ride.user?.photoURL}`}
          fullname={`${ride.user?.firstName} ${ride.user?.lastName}`}
          size={70}
          status={ride.user?.kycScore?.status || 'unverified'}
          statusStyle={{ right: -40, bottom: -3 }}
        />

        <View className="ml-2 flex-1">
          <View className="">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold mr-1 capitalize ">
                {Wordstruncate(
                  `${ride.user?.firstName} ${ride.user?.lastName}`,
                  22,
                )}
              </Text>
              <Ionicons name="car-outline" size={15} color={bgPrimarColor} />
            </View>
            <Text className="text-xs text-gray-500">
              {ride.user?.driver?.model} • {ride.user?.driver?.interior_color} • 
              {ride.user?.driver?.plate_number}
            </Text>
          </View>

          <View className="flex-row justify-between items-center ">
            <View className="flex-row gap-2">
              <Text
                style={{ color: bgPrimarColor }}
                className="text-xs uppercase self-end"
              >
                {ride.user?.accountType}
              </Text>
              <View className="flex-row">
                {ride.user?.driverStatistic?.starDistribution &&
                  ride.user?.driverStatistic.starDistribution.map(
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
            <StatusBadge status={ride.dstatus} />
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
              {ride.origin_address.address}
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
              {ride.pickup_location
                ? ride.pickup_location.address
                : ride.origin_address.address}
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
            {ride.seat_remain}/{ride.seats} seats taken
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Feather name="clock" size={16} color={lightPrimaryColor} />
          <Text className="text-sm text-gray-400">
            {ride.scheduled_time ? formatDateHuman(ride.scheduled_time) : 'N/A'}
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
            <Pressable
              onPress={handleView}
              className="flex-1 justify-center items-center py-1  rounded-md flex-row gap-1 border border-primary-900"
            >
              <Feather name="eye" size={12} color={lightPrimaryColor} />
              <Text className="text-sm text-gray-700 mt-1">View</Text>
            </Pressable>

            {ride.payment_status !== 'completed' ? (
              <Pressable
                onPress={handleJoin}
                className="flex-1 justify-center items-center py-1 bg-primary-900 rounded-md flex-row gap-1"
              >
                <Feather name="check" size={12} color="#fff" />
                <Text className="text-sm text-white mt-1">
                  {'Join Ride'}
                </Text>
              </Pressable>
            ) : null}
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
              pic={ride.user?.driver?.front_car_url ? `${BASEURL}${ride.user?.driver?.front_car_url}` : ''}
              type="front"
            />
            <DriverCarCard
              title="Back Rear"
              pic={ride.user?.driver?.back_car_url ? `${BASEURL}${ride.user?.driver?.back_car_url}` : ''}
              type="back"
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default RideResultCard;
