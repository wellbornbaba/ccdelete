import { View, ActivityIndicator, Text } from 'react-native';
import React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { bgPrimarColor } from '@/utils/colors';

const BgLoading = ({
  popup = false,
  size ="large",
  title = '',
}: {
  popup?: boolean;
  title?: string;
  size?: number | "large" | "small" | undefined
}) => {
  const { colors } = useThemeStore();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      className={`${popup ? 'absolute z-50 top-0 left-0 right-0 bottom-0 bg-white/45' : colors.background}`}
    >
      <ActivityIndicator size={size} color={bgPrimarColor} />
      {title && <Text className="text-xs text-gray-900">{title}</Text>}
    </View>
  );
};

export default BgLoading;
