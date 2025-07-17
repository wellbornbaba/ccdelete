import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { RideCard } from '@/components/rides/RideCard';
import { useThemeStore } from '@/store/useThemeStore';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { postAPI } from '@/utils/fetch';
import { formatDate } from '@/utils';
import { FlashList } from '@shopify/flash-list';
import {
  DashboardPagesHeader,
} from '@/components/ui/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rideBasicLog } from '@/types/vehicle';
import BgLoading from '@/components/BgLoading';

const PAGE_SIZE = 10;

export default function RidesScreen() {
  const { user, JWTtoken } = useAuthStore();
  const [rides, setRides] = useState<rideBasicLog[]>([]);
  const { colors } = useThemeStore();
  cancelAnimationFrame;
  const [tabFilter, setTabFilter] = useState<
    'all' | 'completed' | 'scheduled' | 'cancelled' | 'inprogress'
  >('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  if (!user?.id) return;
  const isDriver = user?.accountType === 'driver';

  const fetchRides = useCallback(
    async (page = 0) => {
      setIsLoading(true);

      const param = {
        userid: user.id,
        page,
        limit: PAGE_SIZE,
      };
      
      try {
        const response = await postAPI(
           isDriver ? `/api/ride-history/driverlogs` : `/api/ride-history/logs`,
          param,
          'POST',
          JWTtoken || undefined,
        );

        if (response.success) {
          const newData: rideBasicLog[] = response.data || [];
          setRides(page === 0 ? newData : (prev) => [...prev, ...newData]);
          setHasMore(newData.length === PAGE_SIZE); // If fewer than PAGE_SIZE, assume no more
          setPage((prev) => prev + 1);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    fetchRides();
  }, [user?.id]);

  const filteredRides = rides
    .filter((ride) => tabFilter === 'all' || ride.dstatus === tabFilter)
    .sort(
      (a, b) =>
        Number(new Date(b.created_at)) -
        Number(new Date(a.created_at)),
    );

  // Group rides by date
  const groupedRides = filteredRides.reduce(
    (groups, ride) => {
      const date = new Date(ride.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(ride);
      return groups;
    },
    {} as Record<string, rideBasicLog[]>,
  );

  // Convert grouped rides to array for FlatList
  const sections = Object.keys(groupedRides).map((date) => ({
    date,
    rides: groupedRides[date],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchRides();
    setRefreshing(false);
  }, [fetchRides]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchRides(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // Render each date section
  const renderSection = ({
    item,
  }: {
    item: { date: string; rides: typeof rides };
  }) => {
    return (
      <View style={styles.section}>
        <View style={[styles.dateHeader, { backgroundColor: colors.card }]}>
          <Feather
            name="calendar"
            size={16}
            color={colors.primary}
            style={styles.calendarIcon}
          />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        {item.rides.map((ride, _index) => (
          <RideCard key={_index} logData={ride} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader
        centerElement={user.accountType ==="driver" ? "Trip History" : 'Ride History'}
        rightElement={
          <AntDesign name="search1" size={22} color={colors.gray} />
        }
      />
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
                tabFilter === 'all' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setTabFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: tabFilter === 'all' ? colors.primary : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 px-4"
          style={[
            {
              borderBottomWidth: 2,
              borderBottomColor:
                tabFilter === 'inprogress' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setTabFilter('inprogress')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  tabFilter === 'inprogress' ? colors.primary : colors.text,
              },
            ]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 px-4"
          style={[
            {
              borderBottomWidth: 2,
              borderBottomColor:
                tabFilter === 'completed' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setTabFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: tabFilter === 'completed' ? colors.primary : colors.text,
              },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          // className={`py-3 px-4 border-b-2`}
          // style={[
          //   { borderBottomColor: 'transparent' },
          //   tabFilter === 'cancelled' && { borderBottomColor: colors.primary },
          // ]}
          className="py-3 px-4"
          style={[
            {
              borderBottomWidth: 2,
              borderBottomColor:
                tabFilter === 'cancelled' ? colors.primary : 'transparent',
            },
          ]}
          //  className={`py-3 px-4  ${tabFilter === 'cancelled' ? 'border-b-bgDefault border-b-2' : 'border-b-transparent'}`}
          onPress={() => setTabFilter('cancelled')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: tabFilter === 'cancelled' ? colors.primary : colors.text,
              },
            ]}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            tintColor={colors.primary}
            colors={[colors.primary]}
            onRefresh={fetchRides}
          />
        }
      >
        {isLoading ? (
          <BgLoading size={'small'} title="Loading..." />
        ) : (
          <>
            {sections.length === 0 ? (
              <View className="items-center justify-center flex-1 p-6">
                <Text
                  className="font-['Inter-SemiBold'] text-base text-center"
                  style={{ color: colors.text }}
                >
                  No rides found
                </Text>
              </View>
            ) : (
              // <FlatList
              //   data={sections}
              //   renderItem={renderSection}
              //   keyExtractor={item => item.date}
              //   contentContainerStyle={styles.listContent}
              // />
              <FlashList
                data={sections}
                keyExtractor={(item) => item.date}
                estimatedItemSize={100}
                renderItem={renderSection}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                  />
                }
                // ListHeaderComponent={<DashboardHeader userData={user} />}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
