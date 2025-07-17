import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { accountTypeProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NAIRA } from '@/utils/fetch';
import { formatCurrency } from '@/utils';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardHero({
  totalride,
  walletBalance,
  accountType,
}: {
  totalride: number;
  walletBalance: string | number;
  accountType: accountTypeProps;
}) {
  return (
    <View className="flex-row gap-4 ">
      <View className={`flex-1 p-4 rounded-lg bg-[#E8FFFC]`}>
        <Text className={`text-sm `}>
          Total {accountType === 'passenger' ? 'Rides' : 'Trips'}
        </Text>
        <Text className={`text-2xl font-bold mt-2`}>{totalride || 0}</Text>
      </View>
      <LinearGradient
        colors={['#076572', '#027F8B']}
        className={`flex-1 p-4 rounded-lg `}
        style={{
            borderRadius: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/wallet')}
        //   className={`flex-1 p-4 rounded-lg `}
        >
          <View className="flex-row items-center">
            <Ionicons name="wallet" size={24} color={'white'} />
            <Text className={`text-sm ml-2 text-white`}> {accountType === 'passenger' ? 'Wallet Balance' : 'Earnings'}</Text>
          </View>
          <Text className={`text-2xl font-bold text-white mt-2`}>
            {NAIRA}
            {formatCurrency(Number(walletBalance))}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
