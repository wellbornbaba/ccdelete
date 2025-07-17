import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { DashboardHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { postAPI } from '@/utils/fetch';
import { router, useFocusEffect } from 'expo-router';
import { Card } from './ui/Card';
import { SearchResProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import RideResultCard from './RideResullt';
import DashboardHero from './ui/DashboardHero';
import RideHistoryCard from './rides/RideHistoryCard';
import { useRideStore } from '@/store/useRideStore';
import { Ride } from '@/types/vehicle';

type TabProps = 'recent' | 'favorite';
// Quick actions data
const quickActions = [
  {
    handler: () => router.navigate('/(root)/ride-category'),
    icon: 'car',
    title: 'Book Ride',
    color: '#2563EB',
  },
  {
    handler: () => router.navigate('/rides'),
    icon: 'clock',
    title: 'My Trips',
    color: '#9333EA',
  },
  { handler: () => {}, icon: 'wallet', title: 'Payment', color: '#EA580C' },
  {
    handler: () => router.navigate('/support'),
    icon: 'account',
    title: 'Support',
    color: '#16A34A',
  },
];

const RidersDashboard = () => {
  const { t } = useTranslation();
  const { setUser, user, JWTtoken, setJWTtoken } = useAuthStore();
  const setRideActiveDetail = useRideStore((s) => s.setRideActiveDetail);
  const setIsAppLoading = useLanguageStore((s) => s.setIsAppLoading);
  
  const { colors } = useThemeStore();
  const [tabSelector, setTabSelector] = useState<TabProps>('recent');
  const [pullRefreshLocation, setPullRefreshLocation] = useState(false);
  const [loadActiveRide, setLoadActiveRide] = useState<Ride|null>(null);
  const [loadRecentLogs, setLoadRecentLogs] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        return;
      }
      const populateData = async () => {
        await handlePullRefresh()
      };

      populateData();
      return () => {};
    }, [setUser]) // Dependencies
  );

  const handlePullRefresh = async () => {
    setIsAppLoading(true);
    try {
      const userDataString = await postAPI(
        `/api/users/${user?.id}`,
        undefined,
        'GET',
        JWTtoken || undefined,
      );

      if (userDataString.success) {
        setJWTtoken(userDataString.data.token)
        setUser(userDataString.data)
        // setLoadRecentLogs(true)
        setLoadActiveRide(userDataString.data.activeRideLog)
        setRideActiveDetail(userDataString.data.activeRideLog);
      }
    } catch (error) {
    } finally {
      setIsAppLoading(false);
    }
  };

  return (
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
        contentContainerStyle={{
          flexGrow: 1,
        }}
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
        <View className="gap-4 my-4">
          {/* Stats Cards */}
          <DashboardHero
            totalride={user?.totalRides || 0}
            accountType={user?.accountType || 'passenger'}
            walletBalance={user?.walletBalance || 0}
          />
          {/* <TripMonitoring /> */}
          {loadActiveRide && (
            <Card classStyle="gap-5 flex-1" elevation={1}>
              <RideResultCard item={loadActiveRide} />
            </Card>
          )}
          {/* Quick Actions */}
          <View className="mt-4">
            <Text
              style={{
                color: colors.text,
              }}
              className="text-sm font-['Inter-Bold'] mb-2 mx-3"
            >
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap items-center justify-evenly">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  style={{ padding: 5, borderRadius: 8, width: '23%' }}
                >
                  <TouchableOpacity
                    key={index}
                    className="w-auto  aspect-square bg-dimColorGray rounded-xl items-center justify-center"
                    onPress={action.handler}
                  >
                    <MaterialCommunityIcons
                      name={action.icon as any}
                      size={24}
                      color={action.color}
                    />
                    <Text className="text-xs mt-2 text-center">
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          </View>

          <View className="mt-4">
            <View className="flex-row justify-between items-center mb-2 mx-3">
              <Text
                style={{
                  color: colors.text,
                }}
                className="text-sm font-['Inter-Bold']"
              >
                Quick Destinations Drivers
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(root)/(modals)/add-address')}
              >
                <Text className="text-bgDefault text-sm font-['Inter-SemiBold']">
                  Add Address
                </Text>
              </TouchableOpacity>
            </View>
            <Card style={{ padding: 5 }} elevation={0}>
              <View
                className="flex-row justify-around p-2 mt-2"
                style={{ backgroundColor: colors.card }}
              >
                <TouchableOpacity
                  className="py-3 px-4"
                  style={[
                    {
                      borderBottomWidth: 2,
                      borderBottomColor:
                        tabSelector === 'recent'
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => setTabSelector('recent')}
                >
                  <Text
                    style={[
                      {
                        color:
                          tabSelector === 'recent'
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                    className="text-sm font-medium font-['Inter-Medium']"
                  >
                    Recent
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-3 px-4"
                  style={[
                    {
                      borderBottomWidth: 2,
                      borderBottomColor:
                        tabSelector === 'favorite'
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => setTabSelector('favorite')}
                >
                  <Text
                    style={[
                      {
                        color:
                          tabSelector === 'favorite'
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                    className="text-sm font-medium font-['Inter-Medium']"
                  >
                    Favorite
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center flex-1 p-6">
                {user?.quickDestinationSearch ? (
                  user.quickDestinationSearch[tabSelector].map(
                    (des: SearchResProps) => (
                      <Text>{des.ride.dest_address}</Text>
                    ),
                  )
                ) : (
                  <Text
                    className="font-['Inter-Regular'] text-xs text-center"
                    style={{ color: colors.text }}
                  >
                    Oop no active Destinations drivers found Book Now!!!
                  </Text>
                )}
              </View>
            </Card>
          </View>
          

          {/* Recent Rides */}
          <Card elevation={0} classStyle="flex-1">
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

            <RideHistoryCard limit={3} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RidersDashboard;
