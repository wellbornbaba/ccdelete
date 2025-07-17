import { View } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { postAPI } from '@/utils/fetch';
import { RideCard } from './RideCard';
import { rideBasicLog } from '@/types/vehicle';
import { FlashList } from '@shopify/flash-list';
import BgLoading from '../BgLoading';

const PAGE_SIZE = 10;

export default function RideHistoryCard({
  limit = 10,
  forceLoad = false,
}: {
  limit?: number;
  forceLoad?: boolean;
}) {
  const { user, JWTtoken } = useAuthStore();
  const [logs, setLogs] = useState<rideBasicLog[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isDriver = user?.accountType === 'driver';
  const fetchPaginatedLogs = useCallback(async () => {
    if (!user?.id || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await postAPI(
        isDriver ? `/api/ride-history/driverlogs` : `/api/ride-history/logs`,
        {
          userid: user.id,
          page,
          limit: limit ? limit : PAGE_SIZE,
        },
        'POST',
        JWTtoken || undefined,
      );

      if (response.success) {
        const newData: rideBasicLog[] = response.data || [];
        setLogs((prev) => [...prev, ...newData]);
        setHasMore(newData.length === PAGE_SIZE); // If fewer than PAGE_SIZE, assume no more

        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Paginated ride logs fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, page, isLoading, hasMore]);

  useEffect(() => {
    if (user) {
      fetchPaginatedLogs();
    }
    // do cleanup
    return () => {};
  }, [limit, forceLoad, user]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPaginatedLogs();
    }
  };

  return (
    <View className="flex-1">
      {isLoading && logs && logs.length > 0 ? (
        <BgLoading size={'small'} title="Please wait, loading.." />
      ) : (
        <FlashList
          data={logs}
          estimatedItemSize={150}
          keyExtractor={(_, i) => `history-${i}`}
          renderItem={({ item }) => <RideCard logData={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoading ? <BgLoading size={'small'} /> : null}
        />
      )}
    </View>
  );
}
