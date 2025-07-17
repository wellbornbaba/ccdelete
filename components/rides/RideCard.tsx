import { View, Text, TouchableOpacity } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { formatAddress, formatCurrency, formatDateHuman } from '@/utils';
import { NAIRA } from '@/utils/fetch';
import { useRideStore } from '@/store/useRideStore';
import { rideBasicLog } from '@/types/vehicle';
import StatusBadge from '../ui/StatusBadge';
import { useAuthStore } from '@/store/useAuthStore';


export function RideCard({ logData }: { logData: any }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const setLogRideId = useRideStore((state) => state.setLogRideId);
  const { colors } = useThemeStore();
  if (!logData) return <Redirect href={'/(root)/(tabs)'} />;
  const parsedLogData: rideBasicLog = {
    id: logData.id,
    rideid: logData.rideid ?? logData.id,
    principal_ride_fee: logData.principal_ride_fee ?? 0,
    shared_fare_price: logData.shared_fare_price,
    pickup_location: logData.pickup_location
      ? logData.pickup_location?.address
      : '',
    boarded_location: logData.boarded_location
      ? logData.boarded_location.address
      : '',
    current_location: logData.current_location
      ? logData.current_location.address
      : '',
    origin_address: logData.origin_address ? logData.origin_address : '',
    destination_address: logData.destination_address
      ? logData.destination_address.address
      : '',
    created_at: logData.created_at,
    dstatus: logData.dstatus,
  };

  const handlePress = () => {

    setLogRideId(
      currentUser?.accountType === 'driver'
        ? parsedLogData.id
        : parsedLogData.rideid || null,
    );
    router.push('/(root)/view-ride');
  };
  
  if (currentUser?.accountType === 'driver') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View className="mb-4 p-4 gap-3 rounded-lg bg-dimColorGray shadow-sm">
          <View className="">
            {/* Origin */}
            <View className="flex-row mb-2">
              <View className="w-6 items-center">
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={'#07657270'}
                />
                <View
                  style={{ backgroundColor: colors.border }}
                  className="w-0.5 h-6 my-0.5"
                />
              </View>
              <View className="flex-1 ml-2">
                <View className="flex-row justify-between">
                  <Text
                    style={{ color: colors.text + '80' }}
                    className="text-xs mb-0.5"
                  >
                    From
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Feather
                      size={16}
                      color={colors.text + '80'}
                      name="credit-card"
                    />
                    <Text style={{ color: colors.text }} className="text-sm">
                      {NAIRA}
                      {formatCurrency(
                        Number(
                          parsedLogData?.principal_ride_fee ||
                            parsedLogData?.principal_ride_fee,
                        ),
                      )}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-medium"
                >
                  {formatAddress(
                    parsedLogData?.pickup_location
                      ? parsedLogData?.pickup_location
                      : (parsedLogData?.origin_address ?? ''),
                  )}
                </Text>
              </View>
            </View>

            {/* Destination */}
            <View className="flex-row">
              <View className="w-6 items-center">
                <Ionicons name="location" size={14} color={'#f8717170'} />
              </View>
              <View className="flex-1 ml-2">
                <Text
                  style={{ color: colors.text + '80' }}
                  className="text-xs mb-0.5"
                >
                  To
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-medium"
                >
                  {formatAddress(parsedLogData?.destination_address ?? '')}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row justify-between ">
            <View className="flex-row items-center gap-2">
              <FontAwesome
                size={16}
                color={colors.text + '80'}
                name="clock-o"
              />
              <Text style={{ color: colors.text }} className="text-sm">
                {formatDateHuman(parsedLogData?.created_at || new Date())}
              </Text>
            </View>

            <StatusBadge status={parsedLogData?.dstatus || 'waiting'} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View className="mb-4 p-4 gap-3 rounded-lg bg-dimColorGray shadow-sm">
        <View className="">
          {/* Origin */}
          <View className="flex-row mb-2">
            <View className="w-6 items-center">
              <Ionicons name="location-outline" size={14} color={'#07657270'} />
              <View
                style={{ backgroundColor: colors.border }}
                className="w-0.5 h-6 my-0.5"
              />
            </View>
            <View className="flex-1 ml-2">
              <View className="flex-row justify-between">
                <Text
                  style={{ color: colors.text + '80' }}
                  className="text-xs mb-0.5"
                >
                  From
                </Text>
                <View className="flex-row items-center gap-2">
                  <Feather
                    size={16}
                    color={colors.text + '80'}
                    name="credit-card"
                  />
                  <Text style={{ color: colors.text }} className="text-sm">
                    {NAIRA}
                    {formatCurrency(
                      Number(
                        parsedLogData?.shared_fare_price ||
                          parsedLogData?.shared_fare_price,
                      ),
                    )}
                  </Text>
                </View>
              </View>
              <Text
                style={{ color: colors.text }}
                className="text-sm font-medium"
              >
                {formatAddress(
                  parsedLogData?.current_location ??
                    parsedLogData?.boarded_location ??
                    parsedLogData?.origin_address ??
                    '',
                )}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View className="flex-row">
            <View className="w-6 items-center">
              <Ionicons name="location" size={14} color={'#f8717170'} />
            </View>
            <View className="flex-1 ml-2">
              <Text
                style={{ color: colors.text + '80' }}
                className="text-xs mb-0.5"
              >
                To
              </Text>
              <Text
                style={{ color: colors.text }}
                className="text-sm font-medium"
              >
                {formatAddress(parsedLogData?.destination_address ?? '')}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row justify-between ">
          <View className="flex-row items-center gap-2">
            <FontAwesome size={16} color={colors.text + '80'} name="clock-o" />
            <Text style={{ color: colors.text }} className="text-sm">
              {formatDateHuman(parsedLogData?.created_at || new Date())}
            </Text>
          </View>

          <StatusBadge status={parsedLogData?.dstatus || 'waiting'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
