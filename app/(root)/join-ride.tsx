import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
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
import { formatCurrency, Wordstruncate } from '@/utils';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';
import { bgPrimarColor, paymentStatusColor, statusColor } from '@/utils/colors';
import { NAIRA, postAPI } from '@/utils/fetch';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Ride, User } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import RideResultCard from '@/components/RideResullt';


export default function JoinRide() {
  const { setSelectedRide, selectRide, rideDetail, setRideDetail } =
    useRideStore();
  // if (!selectRide && !rideDetail) return router.back();
  const JWTtoken = useAuthStore((state) => state.JWTtoken);
  // console.log(selectRide);

  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useThemeStore();
  // const { user, ride } = selectRide;
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'paystack'>(
    'balance',
  );
  const [coupon, setCoupon] = useState('');
  const [useRide, setUseRide] = useState<Ride | null>(
    selectRide ? selectRide.ride : null,
  );
  const [useUser, setUseUser] = useState<User | null>(
    selectRide ? selectRide.user : null,
  );
  const [init, setInit] = useState(false);

  useEffect(() => {
    const getRideUser = async () => {
      setIsLoading(true);

      try {
        const userRes = await postAPI(
          `/api/users/${rideDetail?.driverid}`,
          '',
          'GET',
          JWTtoken || '',
        );
        console.log(userRes);

        if (userRes.success) {
          setUseUser(userRes.data);
          return;
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
        setInit(true);
      }
    };

    if (rideDetail) {
      setUseRide(rideDetail);
      getRideUser();
    }
  }, []);

  const handleBooking = async () => {
    Keyboard.dismiss();
    
  };

  // if (!init || isLoading) return <BgLoading popup={true} title="please wait, fetching detail..." />;
  if (!useUser && !useRide && init) return router.back();

  return (
    <SafeAreaView
      className="flex-1 px-4 mb-0"
      style={{ backgroundColor: colors.background }}
    >
      {!init ||
        (isLoading && (
          <BgLoading popup={true} title="please wait, fetching detail..." />
        ))}

      <DashboardPagesHeader
        onBack={true}
        onBackHandle={() => {
          setRideDetail(null);
          setSelectedRide(null);
        }}
        centerElement={rideDetail ? 'Ride Detail' : 'Join Ride'}
      />
      {!useUser ? (
        <BgLoading popup={true} title="please wait, fetching detail..." />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="my-3 flex-1">
            {/* <Text className="text-base font-semibold my-3">Detail</Text> */}
            <Card classStyle="gap-5 mb-10" elevation={0}>
              {useRide && useUser && (
                <RideResultCard
                  item={{ ride: useRide, user: useUser }}
                  preview={true}
                />
              )}
            </Card>
            <View className="mb-10">
              <Text className="text-md font-['Inter-SemiBold'] mb-2">
                Passengers
                {/* ({useRide.seat_remain}/{useUser?.driver?.seats}) */}
              </Text>
              <Card classStyle="gap-2" elevation={0}>
                <View className="justify-between items-center flex-row px-1">
                  <View className="justify-between items-center flex-row gap-3">
                    <AvatarWithStatus
                      photoURL={`${useUser?.photoURL ?? ''}`}
                      fullname={`${useUser?.firstName} ${useUser?.lastName}`}
                      size={58}
                      status={useUser?.kycScore?.status || 'unverified'}
                      statusStyle={{ right: -50, bottom: -3 }}
                    />
                    <Text className="text-lg font-['Inter-Regular'] mr-1 capitalize ">
                      {Wordstruncate(
                        `${useUser?.firstName} ${useUser?.lastName}`,
                        22,
                      )}
                    </Text>
                  </View>
                  <Text>Boarded</Text>
                </View>
              </Card>
            </View>
            <View className="mb-10 ">
              <View className="flex-row items-center justify-between">
                <Text className="text-md font-['Inter-SemiBold'] mb-2">
                  Payment Method
                </Text>
                <Text
                  style={{ color: paymentStatusColor[useRide?.payment_status || "pending"] }}
                  className="text-sm font-semibold capitalize bg-gray-100 px-3 py-1 rounded-full"
                >
                  {useRide?.payment_status}
                </Text>
              </View>
              <View className="gap-2">
                {rideDetail && useRide ? (
                  <Card
                    classStyle={`gap-2 py-3`}
                    elevation={0}
                    style={
                      paymentMethod === 'balance'
                        ? {
                            borderColor: bgPrimarColor,
                            borderWidth: 2,
                          }
                        : {}
                    }
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row gap-4 items-center">
                        {useRide.payment_method === 'balance' ? (
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
                            {useRide.payment_method === 'balance'
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
                ) : (
                  <>
                    <Card
                      classStyle={`gap-2 py-3`}
                      elevation={0}
                      style={
                        paymentMethod === 'balance'
                          ? {
                              borderColor: bgPrimarColor,
                              borderWidth: 2,
                            }
                          : {}
                      }
                    >
                      <TouchableOpacity
                        onPress={() => setPaymentMethod('balance')}
                        className="flex-row items-center justify-between"
                      >
                        <View className="flex-row gap-4 items-center">
                          <Ionicons
                            name="wallet"
                            size={28}
                            color={bgPrimarColor}
                          />
                          <View>
                            <Text className="text-lg font-['Inter-SemiBold'] text-gray-700">
                              Wallet Balance
                            </Text>
                            <Text className="text-sm font-bold text-gray-400">
                              {NAIRA}
                              {formatCurrency(useUser?.walletBalance || 0)}{' '}
                              available
                            </Text>
                          </View>
                        </View>
                        <MaterialIcons
                          name={
                            paymentMethod === 'balance'
                              ? 'radio-button-checked'
                              : 'radio-button-unchecked'
                          }
                          size={20}
                          color={bgPrimarColor}
                        />
                      </TouchableOpacity>
                    </Card>
                    <Card
                      classStyle={`gap-2 py-3`}
                      elevation={0}
                      style={
                        paymentMethod === 'paystack'
                          ? {
                              borderColor: bgPrimarColor,
                              borderWidth: 2,
                            }
                          : {}
                      }
                    >
                      <TouchableOpacity
                        onPress={() => setPaymentMethod('paystack')}
                        className="flex-row items-center justify-between "
                      >
                        <View className="flex-row gap-4 items-center">
                          <MaterialCommunityIcons
                            name="credit-card-plus-outline"
                            size={28}
                            color={bgPrimarColor}
                          />

                          <Text className="text-lg font-['Inter-SemiBold'] text-gray-700">
                            PayStack
                          </Text>
                        </View>
                        <MaterialIcons
                          name={
                            paymentMethod === 'paystack'
                              ? 'radio-button-checked'
                              : 'radio-button-unchecked'
                          }
                          size={20}
                          color={bgPrimarColor}
                        />
                      </TouchableOpacity>
                    </Card>
                    <Input
                      label=""
                      value={coupon}
                      onChangeText={setCoupon}
                      placeholder="Enter coupon code"
                      keyboardType="default"
                      autoCapitalize="none"
                      inputStyle={{
                        height: 54,
                      }}
                      icon={
                        <MaterialCommunityIcons
                          name="tag-arrow-up-outline"
                          size={20}
                          color={colors.text + '80'}
                        />
                      }
                    />
                  </>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      {rideDetail && useRide ? (
        <View className="p-2 flex-row justify-between items-center gap-2">
          <Button
            title={useRide?.dstatus ?? ''}
            onPress={() => {}}
            disabled
            classStyle="mb-0 flex-1"
            style={{
              backgroundColor: statusColor[useRide?.dstatus || 'waiting'],
            }}
          />

          <Button
            title={useRide?.dstatus === 'completed' ? 'Share' : 'Cancel'}
            onPress={() => {}}
            classStyle="mb-0 flex-1"
            style={{
              backgroundColor: bgPrimarColor,
            }}
          />
        </View>
      ) : (
        <Button
          title="Confirm Booking"
          onPress={handleBooking}
          isLoading={isLoading}
          classStyle="mb-0"
        />
      )}
    </SafeAreaView>
  );
}
