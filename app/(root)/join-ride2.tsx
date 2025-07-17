import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import BgLoading from '@/components/BgLoading';
import { useThemeStore } from '@/store/useThemeStore';
import { router } from 'expo-router';
import { useRideStore } from '@/store/useRideStore';
import { Card } from '@/components/ui/Card';
import AvatarWithStatus from '@/components/ui/AvatarWithStatus';
import { formatCurrency, getDeviceDetails, Wordstruncate } from '@/utils';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';
import { bgPrimarColor, paymentStatusColor, statusColor } from '@/utils/colors';
import { NAIRA, postAPI } from '@/utils/fetch';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PaymentMethodType } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import RideResultCard from '@/components/RideResullt';
import { useProfileStore } from '@/store/useProfileStore';
import { useLanguageStore } from '@/store/useLanguageStore';

export default function JoinRide() {
  const { rideDetail, setRideDetail } = useRideStore();
  const JWTtoken = useAuthStore((state) => state.JWTtoken);
  const setUserProfileData = useProfileStore((s) => s.setUserProfileData);
  const setIsAppLoading = useLanguageStore((s) => s.setIsAppLoading);

  if (!rideDetail) return router.back();

  const { user } = rideDetail;
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useThemeStore();
  const [coupon, setCoupon] = useState('');
  const [init, setInit] = useState(false);
  const ridePaymentStatus =
    rideDetail.payment_status === 'completed' ? true : false;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    rideDetail.payment_method,
  );
  const kycscore = user?.kycScore?.status;
  const usedSeat = Number(rideDetail?.rideHistory?.length ?? 0);

  const handlePullRefresh = async () => {
    setIsAppLoading(true);
    try {
      const userRes = await postAPI(
        `/api/rides/${rideDetail.id}`,
        '',
        'GET',
        JWTtoken || '',
      );

      if (userRes.success) {
        setRideDetail(userRes.data);
        return;
      }
    } catch (error) {
    } finally {
      setIsAppLoading(false);
    }
  };

  const handleBooking = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    const vitalDetail = await getDeviceDetails()
    const param = {
      userid: user?.id ?? '',
      rideid: rideDetail.id,
      payment_method: paymentMethod,
      device_name: vitalDetail.devicename,
      device_number: vitalDetail.devicename,
      ip: vitalDetail.ip,
    };

    try {
      const userRes = await postAPI(
        `/api/ride-history/${rideDetail.id}`,
        param,
        'PUT',
        JWTtoken || '',
      );

      if (userRes.success) {
        // setUseUser(userRes.data);
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setInit(true);
    }
  };

  return (
    <>
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
          centerElement={'Ride Detail'}
        />
        {!rideDetail ? (
          <BgLoading popup={true} title="please wait, fetching detail..." />
        ) : (
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
                <RideResultCard item={rideDetail} preview={true} />
              </Card>
              <View className="mb-10">
                <Text className="text-md font-['Inter-SemiBold'] mb-2">
                  Passengers ({usedSeat}/{rideDetail.seats})
                </Text>
                <Card classStyle="gap-2" elevation={0}>
                  {rideDetail?.rideHistory &&
                    rideDetail.rideHistory.length > 0 &&
                    rideDetail.rideHistory.map((item) => (
                      <TouchableOpacity
                        className="justify-between items-center flex-row px-1"
                        key={item.userid}
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
                            photoURL={`${item.user?.photoURL}`}
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
                          rideDetail?.payment_status || 'pending'
                        ],
                    }}
                    className="text-sm font-semibold capitalize bg-gray-100 px-3 py-1 rounded-full"
                  >
                    {rideDetail?.payment_status}
                  </Text>
                </View>
                <View className="gap-2">
                  {rideDetail ? (
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
                          {paymentMethod === 'balance' ? (
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
                              {paymentMethod === 'balance'
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
                                {formatCurrency(user?.walletBalance || 0)}{' '}
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
        {ridePaymentStatus ? (
          <View className="p-2 flex-row justify-between items-center gap-2">
            <Button
              title={rideDetail?.dstatus ?? 'Waiting'}
              onPress={() => {}}
              disabled
              classStyle="mb-0 flex-1"
              style={{
                backgroundColor: statusColor[rideDetail?.dstatus || 'waiting'],
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
        ) : (
          <Button
            title="Confirm Booking"
            onPress={handleBooking}
            isLoading={isLoading}
            classStyle="mb-0"
          />
        )}
      </SafeAreaView>
    </>
  );
}
