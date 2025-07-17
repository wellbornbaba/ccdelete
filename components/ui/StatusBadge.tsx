import { View, Text } from 'react-native';
import React from 'react';
import { statusColor } from '@/utils/colors';
import { RideStatus } from '@/types';

export default function StatusBadge({ status }: { status: RideStatus }) {
  return (
    <View
      style={{ backgroundColor: statusColor[status] + '20' }}
      className="px-2 py-1 rounded-lg"
    >
      <Text
        style={{ color: statusColor[status] }}
        className="text-xs font-semibold capitalize"
      >
        {status}
      </Text>
    </View>
  );
}
