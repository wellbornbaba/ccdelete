import { View, Text } from 'react-native';
import React from 'react';
import { WalletCardProps } from '@/types';
import { Card } from './Card';
import { Feather } from '@expo/vector-icons';
import { formatCurrency, formatDate } from '@/utils';
import { NAIRA } from '@/utils/fetch';
import { bgPrimarColor } from '@/utils/colors';
import { useThemeStore } from '@/store/useThemeStore';


const WalletCard = ({
  key,
  amount,
  status,
  date,
  fundType,
}: WalletCardProps) => {
  const colors = useThemeStore((state) => state.colors);

  return (
    <Card key={key} classStyle="border-0 shadow-none mb-2 px-4" elevation={0}>
      <View className="flex-row items-center py-2">
        <View
          className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
            status === 'Successful' ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {status === 'Successful' ? (
            <Feather name="plus" size={20} color={bgPrimarColor} />
          ) : (
            <Feather name="minus" size={20} color={colors.error} />
          )}
        </View>
        <View className="flex-1">
          <Text className="font-medium">{fundType}</Text>
          <Text className="text-sm text-gray-500">{formatDate(date)}</Text>
        </View>
        <View className="items-end">
          <Text
            className={`font-medium ${status === 'Successful' ? 'text-green-600' : 'text-red-600'}`}
          >
            {NAIRA}
            {formatCurrency(amount)}
          </Text>
          <Text className="text-green-800  text-xs">{status}</Text>
        </View>
      </View>
    </Card>
  );
};

export default WalletCard;
