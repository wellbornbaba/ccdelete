import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { calculateDistanceKm, formatCurrency } from '@/utils';
import { NAIRA, postAPI } from '@/utils/fetch';
import { Redirect, router, useFocusEffect } from 'expo-router';
import DashboardHero from './ui/DashboardHero';
import { DashboardHeader } from './ui/Header';
import { useLanguageStore } from '@/store/useLanguageStore';
import { bgPrimarColor } from '@/utils/colors';
import RideHistoryCard from './rides/RideHistoryCard';
import { User } from '@/types';
import { RideRequest } from '@/types/vehicle';
import { useRideStore } from '@/store/useRideStore';
import RideResultCard from './RideResullt';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');
// Mock data for active trip
const weeklyInit = [
  { day: 'Mon', amount: 0 },
  { day: 'Tue', amount: 0 },
  { day: 'Wed', amount: 0 },
  { day: 'Thu', amount: 0 },
  { day: 'Fri', amount: 0 },
  { day: 'Sat', amount: 0 },
  { day: 'Sun', amount: 0 },
];
const recentTrips = [
  {
    id: '1',
    passenger: 'Omotola Williams',
    destination: 'Lekki to Victoria Island',
    fare: 2500,
    rating: 4.8,
    time: 'Today, 2:30 PM',
  },
  {
    id: '2',
    passenger: 'Ahmed Musa',
    destination: 'Ikeja to Surulere',
    fare: 1800,
    rating: 4.9,
    time: 'Today, 12:15 PM',
  },
];

export default function DriversDashboard() {
  const { setUser, user, JWTtoken } = useAuthStore();
  const rideActiveDetail = useRideStore((s) => s.rideActiveDetail);
  const setRideActiveDetail = useRideStore((s) => s.setRideActiveDetail);
  const { colors } = useThemeStore();
  const setIsAppLoading = useLanguageStore((s) => s.setIsAppLoading);
  const [pullRefreshLocation, setPullRefreshLocation] = useState(false);
  const [activeTripRequest, setActiveTripRequest] =
    useState<RideRequest | null>(user?.rideRequest || null);
  const [weeklyEarnings, setWeeklyEarnings] = useState(weeklyInit);

  if (!user) return <Redirect href={'/(auth)'} />;

  const isOnline = user?.isAvaliable;
  const activeTrip = rideActiveDetail ?? null;
  const distance = calculateDistanceKm(
    {
      lat: activeTripRequest?.pickup_lat ?? 0,
      lng: activeTripRequest?.pickup_lng ?? 0,
      address: activeTripRequest?.pickup_address ?? '',
    },
    {
      lat: activeTripRequest?.dest_lat ?? 0,
      lng: activeTripRequest?.dest_lng ?? 0,
      address: activeTripRequest?.dest_address ?? '',
    },
  );

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        return;
      }
      const populateData = async () => {
        await handlePullRefresh();
      };

      populateData();
      return () => {};
    }, [setUser]), // Dependencies
  );

  useEffect(() => {
    if (user?.weekEarnings) {
      setWeeklyEarnings(user.weekEarnings);
    }
  }, [user]);

  const handleCancelActiveRequestTrip = async () => {
    const payload = {
      userid: user?.id,
    };

    setIsAppLoading(true);
    try {
      const rideRes = await postAPI(
        `/api/ride-request/${activeTripRequest?.id}`,
        payload,
        'DELETE',
        JWTtoken || '',
      );

      if (rideRes.success) {
        Toast.show({
          type: 'success',
          text1: 'Trip cancelled successflly',
        });

        setActiveTripRequest(null);
        setUser(rideRes.data);
        return;
      }
      Toast.show({
        type: 'error',
        text1: 'Error unable to create, try again',
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsAppLoading(false);
    }
  };

  const handleCancelTrip = () => {
    Alert.alert(
      'Cancel Trip Session',
      'Are you sure you want to cancel this trip?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => handleCancelActiveRequestTrip(),
        },
      ],
    );
  };

  const handleGoOffline = async () => {
    setIsAppLoading(true);

    try {
      const rideRes = await postAPI(
        `/api/users/${user?.id}/isavailable`,
        { status: false },
        'PATCH',
        JWTtoken || '',
      );

      if (rideRes.success) {
        Toast.show({
          type: 'success',
          text1: 'Youre now offline',
        });

        setActiveTripRequest(null);
        const resUser: User = {
          ...user,
          isAvaliable: false,
        };
        setUser(resUser);
        return;
      }

      Toast.show({
        type: 'error',
        text1: rideRes.message,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsAppLoading(false);
    }
  };

  const handleToggleOnlineStatus = () => {
    // Check if there is any active/ongoing ride when driver is trying to go offline
    if (
      isOnline &&
      ['completed', 'cancelled'].includes(activeTrip?.dstatus || 'waiting')
    ) {
      Alert.alert(
        'Cannot Go Offline',
        'You have an active ride in progress. Please complete or cancel your current trip before going offline.',
        [{ text: 'OK', style: 'default' }],
      );
      return;
    }

    Alert.alert(
      isOnline ? 'Go Offline' : 'Go Online',
      isOnline
        ? 'You will stop receiving trip requests and cancel any pending trip session'
        : 'You will start receiving trip requests',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isOnline ? 'Go Offline' : 'Go Online',
          onPress: () => {
            isOnline
              ? handleGoOffline()
              : router.push('/(root)/driver-ride-starter');
          },
        },
      ],
    );
  };

  const handlePullRefresh = useCallback(async () => {
    setIsAppLoading(true);
    try {
      const userDataString = await postAPI(
        `/api/users/${user?.id}`,
        undefined,
        'GET',
        JWTtoken || undefined,
      );

      if (userDataString.success) {
        setActiveTripRequest(userDataString.data.rideRequest);
        setUser(userDataString.data);
      }
    } catch (error) {
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  const renderWeeklyChart = () => {
    const maxAmount = Math.max(...weeklyEarnings.map((item) => item.amount));

    return (
      <View className="gap-4">
        <Text
          className="text-base font-bold mb-2"
          style={{ color: colors.text }}
        >
          Weekly Earnings
        </Text>
        <View className="flex-row justify-between items-end h-24 px-2">
          {weeklyEarnings.map((item, index) => {
            const height = (item.amount / maxAmount) * 80;
            return (
              <View key={index} className="gap-2 items-center">
                <View className="h-20 w-6 justify-end">
                  <View
                    style={{
                      height: height,
                      backgroundColor: colors.primary,
                    }}
                    className="w-full rounded-md"
                  />
                </View>
                <Text className="text-xs" style={{ color: colors.text }}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
        <View className="flex-row justify-between px-2">
          <Text style={{ fontSize: 12, opacity: 0.7, color: colors.text }}>
            0
          </Text>
          <Text style={{ fontSize: 12, opacity: 0.7, color: colors.text }}>
            {maxAmount ? (maxAmount / 1000).toFixed(0) : 0}k
          </Text>
        </View>
      </View>
    );
  };

  console.log(user.activeRideLog);
  
  return (
    <>
      <SafeAreaView
        className="px-4"
        style={{ backgroundColor: colors.background }}
      >
        <DashboardHeader
          userData={user}
          pullToRefresh={pullRefreshLocation}
          setPullToRefresh={setPullRefreshLocation}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              tintColor={colors.primary}
              colors={[colors.primary]}
              onRefresh={handlePullRefresh}
            />
          }
        >
          <View className="gap-4">
            {/* Dashboard Title and Status */}
            <View className="flex-row justify-between items-center">
              <Text
                className="font-bold text-2xl"
                style={{ color: colors.text }}
              >
                Dashboard
              </Text>

              <View
                className="flex-row bg-neutral-400 rounded-3xl"
                style={{ borderRadius: 24 }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: isOnline ? bgPrimarColor : 'transparent',
                  }}
                  onPress={handleToggleOnlineStatus}
                  className="px-4 py-2 rounded-3xl"
                >
                  <Text className="text-white text-sm font-medium">Online</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: !isOnline ? colors.error : 'transparent',
                  }}
                  onPress={handleToggleOnlineStatus}
                  className="px-4 py-2 rounded-3xl"
                >
                  <Text className="text-white text-sm font-medium">
                    Offline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <DashboardHero
              totalride={user?.totalRides || 0}
              accountType={user?.accountType || 'passenger'}
              walletBalance={user?.earnings || 0}
            />
            {activeTrip && (
              <Card classStyle="gap-5 flex-1" elevation={1}>
                <RideResultCard item={activeTrip} />
              </Card>
            )}
            <Card elevation={0} classStyle="bg-gray-400 p-4 rounded-xl">
              <Text
                className="text-base font-bold mb-2"
                style={{ color: colors.text }}
              >
                Performance
              </Text>

              <View className=" gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    Rating
                  </Text>
                  <View className="flex-row items-center space-x-2">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: colors.text }}
                    >
                      {user?.driverStatistic?.avgRating || 0}
                    </Text>
                    <View className="flex-row">
                      {user?.driverStatistic?.starDistribution &&
                        user.driverStatistic.starDistribution.map(
                          (item, _index) => (
                            <Feather
                              key={_index}
                              name="star"
                              size={14}
                              color={
                                item.star <= item.count ? '#FFD700' : '#E0E0E0'
                              }
                              style={{ marginLeft: 2 }}
                            />
                          ),
                        )}
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    Acceptance Rate
                  </Text>
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {user?.driverStatistic?.acceptanceRate || 0}%
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    Completion Rate
                  </Text>
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {user?.driverStatistic?.completionRate || 0}%
                  </Text>
                </View>
              </View>
            </Card>
            {activeTripRequest && (
              <Card elevation={0}>
                <TouchableOpacity onPress={handleCancelTrip}>
                  <View className="flex-row justify-between items-center mb-4">
                    <Text
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      Current Trip Session
                    </Text>
                    <View className="bg-red-400 rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-semibold uppercase">
                        {activeTripRequest.dstatus}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-4">
                    <View className="flex-row items-center gap-3">
                      <Avatar
                        source={`${user?.photoURL}`}
                        name={`${user?.firstName} ${user?.lastName}`}
                        size={40}
                      />
                      <View className="flex-1 gap-1">
                        <Text
                          className="text-base font-semibold"
                          style={{ color: colors.text }}
                        >
                          {`${user?.firstName} ${user?.lastName}`}
                        </Text>
                        <Text
                          className="text-sm opacity-70"
                          style={{ color: colors.text }}
                        >
                          {user?.driver?.model} • {user?.driver?.plate_number}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-3">
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="#4CAF50"
                        />
                        <Text
                          className="text-sm font-medium"
                          style={{ color: colors.text }}
                        >
                          Pickup Location
                        </Text>
                      </View>
                      <Text
                        className="ml-6 text-sm opacity-80"
                        style={{ color: colors.text }}
                      >
                        {activeTripRequest.pickup_address}
                      </Text>

                      <View className="flex-row items-center gap-2">
                        <Ionicons name="location" size={16} color="#F44336" />
                        <Text
                          className="text-sm font-medium"
                          style={{ color: colors.text }}
                        >
                          Destination
                        </Text>
                      </View>
                      <Text
                        className="ml-6 text-sm opacity-80"
                        style={{ color: colors.text }}
                      >
                        {activeTripRequest.dest_address}
                      </Text>

                      <View className="flex-row justify-between mt-2">
                        <View className="items-center gap-1">
                          <Text
                            className="text-xs opacity-70"
                            style={{ color: colors.text }}
                          >
                            Estimated Time
                          </Text>
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            N/A
                          </Text>
                        </View>
                        <View className="items-center gap-1">
                          <Text
                            className="text-xs opacity-70"
                            style={{ color: colors.text }}
                          >
                            Distance
                          </Text>
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            {distance} km
                          </Text>
                        </View>
                        <View className="items-center gap-1">
                          <Text
                            className="text-xs opacity-70"
                            style={{ color: colors.text }}
                          >
                            Fare
                          </Text>
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: colors.primary }}
                          >
                            {NAIRA}
                            {formatCurrency(
                              activeTripRequest.principal_ride_fee ?? '',
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* <TripMonitoring
                  trip={activeTrip}
                  onTripComplete={handleTripComplete}
                  onTripCancel={handleTripCancel}
                /> */}
                  </View>
                </TouchableOpacity>
              </Card>
            )}
            <Card elevation={0}>{renderWeeklyChart()}</Card>
            <Card elevation={0} classStyle="flex-1 mb-10">
              <View className="flex-row justify-between items-center mb-2 mx-3">
                <Text
                  style={{
                    color: colors.text,
                  }}
                  className="text-sm font-['Inter-Bold']"
                >
                  Recent Rides
                </Text>
                <TouchableOpacity onPress={() => router.push('/rides')}>
                  <Text className="text-bgDefault text-sm font-['Inter-SemiBold']">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <RideHistoryCard />
            </Card>
            
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
