import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import BgLoading from '@/components/BgLoading';
import { useThemeStore } from '@/store/useThemeStore';
import { router } from 'expo-router';
import { useRideStore } from '@/store/useRideStore';
import { Card } from '@/components/ui/Card';
import AvatarWithStatus from '@/components/ui/AvatarWithStatus';
import { Wordstruncate } from '@/utils';
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { bgPrimarColor, paymentStatusColor, statusColor } from '@/utils/colors';
import { postAPI } from '@/utils/fetch';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import RideResultCard from '@/components/RideResullt';
import { useProfileStore } from '@/store/useProfileStore';
import { User } from '@/types';
import { Ride } from '@/types/vehicle';

export default function ViewRide() {
  const { colors } = useThemeStore();
  const logRideId = useRideStore((state) => state.logRideId);

  if (!logRideId) return router.back();

  const JWTtoken = useAuthStore((state) => state.JWTtoken);
  const user = useAuthStore((s) => s.user);
  const setUserProfileData = useProfileStore((s) => s.setUserProfileData);
  const [rideUser, setRideUser] = useState<User | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [coupon, setCoupon] = useState('');
  const ridePaymentStatus = ride?.payment_status === 'completed' ? true : false;

  const kycscore = rideUser?.kycScore?.status;
  const usedSeat = Number(ride?.rideHistory?.length ?? 0);
  

  useEffect(() => {
    handlePullRefresh()

  }, [logRideId]);

  const handlePullRefresh = async () => {
     setIsLoading(true);
      try {
        const response = await postAPI(
          `/api/rides/${logRideId}`,
          undefined,
          'GET',
          JWTtoken || undefined,
        );

        if (response.success) {
          setRide(response.data);
          setRideUser(response.data.user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <>
      <SafeAreaView
        className="flex-1 px-4 mb-0"
        style={{ backgroundColor: colors.background }}
      >
        <DashboardPagesHeader
          onBack={true}
          centerElement={user?.accountType === 'driver' ? 'Trips Detail' :'Ride Detail'}
        />
        {isLoading ? (
          <BgLoading popup={true} title="please wait, fetching detail..." />
        ) : (
          <>
            {!ride ? (
              <View className='flex-1 justify-center items-center'>
                <Text className='text-sm text-gray-400'>Oop something went wrong, try again</Text>
                </View>
            ) : (
              <>
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  refreshControl={
                    <RefreshControl
                      refreshing={false}
                      tintColor={colors.primary}
                      colors={[colors.primary]}
                      onRefresh={handlePullRefresh}
                    />
                  }
                >
                  <View className="my-3 flex-1">
                    <Card classStyle="gap-5 mb-10" elevation={0}>
                      <RideResultCard item={ride} preview={true} />
                    </Card>
                    <View className="mb-10">
                      <Text className="text-md font-['Inter-SemiBold'] mb-2">
                        Passengers ({usedSeat}/{ride.seats})
                      </Text>
                      <Card classStyle="gap-2" elevation={0}>
                        {ride?.rideHistory &&
                          ride.rideHistory.length > 0 &&
                          ride.rideHistory.map((item, _index) => (
                            <TouchableOpacity
                              className="justify-between items-center flex-row px-1"
                              key={_index}
                              onPress={() => {
                                router.navigate('/(root)/profile');
                                setUserProfileData(
                                  item?.user
                                    ? {
                                        ...item.user,
                                        photoURL:
                                          item.user.photoURL === null
                                            ? undefined
                                            : item.user.photoURL,
                                      }
                                    : null,
                                );
                              }}
                            >
                              <View className="justify-between items-center flex-row gap-3">
                                <AvatarWithStatus
                                  photoURL={`${item.user?.photoURL ?? ''}`}
                                  fullname={`${item.user?.firstName} ${item.user?.lastName}`}
                                  size={62}
                                  status={kycscore || 'unverified'}
                                  statusStyle={{ right: -50, bottom: -3 }}
                                />
                                <Text className="text-sm font-['Inter-Regular'] mr-1 capitalize ">
                                  {Wordstruncate(
                                    `${item.user?.firstName} ${item.user?.lastName}`,
                                    22,
                                  )}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  color: statusColor[item.dstatus || 'waiting'],
                                }}
                                className="text-xs font-semibold capitalize rounded-xl"
                              >
                                {item.dstatus}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </Card>
                    </View>
                    <View className="mb-10 ">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-md font-['Inter-SemiBold'] mb-2">
                          Payment Method
                        </Text>
                        <Text
                          style={{
                            color:
                              paymentStatusColor[
                                ride?.payment_status || 'pending'
                              ],
                          }}
                          className="text-sm font-semibold capitalize bg-gray-100 px-3 py-1 rounded-full"
                        >
                          {ride?.payment_status}
                        </Text>
                      </View>
                      <View className="gap-2">
                        <Card
                          classStyle={`gap-2 py-3`}
                          elevation={0}
                          style={
                            ride.payment_method === 'balance'
                              ? {
                                  borderColor: bgPrimarColor,
                                  borderWidth: 2,
                                }
                              : {}
                          }
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row gap-4 items-center">
                              {ride.payment_method === 'balance' ? (
                                <Ionicons
                                  name="wallet"
                                  size={28}
                                  color={bgPrimarColor}
                                />
                              ) : (
                                <MaterialCommunityIcons
                                  name="credit-card-plus-outline"
                                  size={28}
                                  color={bgPrimarColor}
                                />
                              )}
                              <View>
                                <Text className="text-lg font-['Inter-SemiBold'] text-gray-700">
                                  {ride.payment_method === 'balance'
                                    ? 'Wallet Balance'
                                    : 'Paystack'}
                                </Text>
                              </View>
                            </View>
                            <Octicons
                              name={'check-circle-fill'}
                              size={20}
                              color={bgPrimarColor}
                            />
                          </View>
                        </Card>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View className="p-2 flex-row justify-between items-center gap-2">
                  <Button
                    title={ride?.dstatus ?? 'Waiting'}
                    onPress={() => {}}
                    disabled
                    classStyle="mb-0 flex-1"
                    style={{
                      backgroundColor: statusColor[ride?.dstatus || 'waiting'],
                    }}
                  />

                  <Button
                    title={ridePaymentStatus ? 'Share' : 'Cancel'}
                    onPress={() => {}}
                    classStyle="mb-0 flex-1"
                    style={{
                      backgroundColor: bgPrimarColor,
                    }}
                  />
                </View>
              </>
            )}
          </>
        )}
      </SafeAreaView>
    </>
  );
}
