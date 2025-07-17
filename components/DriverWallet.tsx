import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DashboardPagesHeader } from './ui/Header';
import { useAuthStore } from '@/store/useAuthStore';
import {
  formatCurrency,
} from '@/utils';
import { TransactionWalletStatus, TransactionWalletType } from '@/types';
import { NAIRA } from '@/utils/fetch';
import {
  Feather,
  Ionicons,
} from '@expo/vector-icons';
import WalletCard from './ui/WalletCard';
import { bgPrimarColor, textGrayColor } from '@/utils/colors';
import { Card } from './ui/Card';
import { useThemeStore } from '@/store/useThemeStore';
import BankAccountCard from './ui/BankAccountCard';

const DriverWallet = () => {
  const user = useAuthStore((state) => state.user);
  const colors = useThemeStore((state) => state.colors);
  const [amount, setAmount] = useState('');
  // Quick amount selection options


  // const bankAccounts = [
  //   {
  //     id: 22,
  //     bank_name: 'Gtbank',
  //     account_type: 'Saving',
  //     account_name: 'Ade Emeka Ahmen',
  //     account_number: '4545454545',
  //     approve: true,
  //     dstatus: true,
  //     driver: mockDriver,
  //   },
  //   {
  //     id: 2,
  //     bank_name: 'First bank',
  //     account_type: 'Saving',
  //     account_name: 'Ade Emeka Ahmen',
  //     account_number: '2324434344',
  //     approve: false,
  //     dstatus: true,
  //     driver: mockDriver,
  //   },
  //   {
  //     id: 20,
  //     bank_name: 'Zenith',
  //     account_type: 'Current',
  //     account_name: 'Emeka Ahmen',
  //     account_number: '90003899',
  //     approve: false,
  //     dstatus: false,
  //     driver: mockDriver,
  //   },
  // ];

  return (
    <>
      <DashboardPagesHeader onBack={true} centerElement={'Driver Earnings'} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="my-8 flex-1">
          {/* Balance Section */}
          <View className="flex flex-col items-center my-2 mb-8">
            <Text className="text-gray-500 mb-1 text-lg">
              This weeks's Earnings
            </Text>
            <View className="flex items-center">
              <Text className="text-4xl font-bold font-['Inter-Bold']">
                {NAIRA}
                {formatCurrency(user?.earnings || 0)}
              </Text>

              <TouchableOpacity className="ml-1 absolute -top-1 -right-7">
                <Ionicons
                  name="refresh-sharp"
                  size={20}
                  color={bgPrimarColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 p-6 rounded-3xl bg-bgDefault flex-1 h-auto">
            <Text className="text-lg text-white">Available for Withdrawal</Text>
            <Text className="text-3xl font-bold font-['Inter-Bold'] my-0 text-white">
              {NAIRA}
              {formatCurrency(user?.available_earnings || 0)}
            </Text>

            <TouchableOpacity className="rounded-xl bg-white p-4 w-2/3">
              <Text className="text-bgDefault font-['Inter-SemiBold'] text-xl ">
                Withdraw Fund
              </Text>
            </TouchableOpacity>
          </View>
          <View className="h-1 bg-gray-200 mt-4 mb-0" />
          {/* Bank Accounts Section */}
          <View className="my-12">
            <View className="flex-row justify-between items-center mb-0">
              <Text className="font-['Inter-Bold'] text-lg mb-4">
                Bank Accounts
              </Text>

              <TouchableOpacity className="flex-row ">
                <Feather name="plus" size={20} color={bgPrimarColor} />
                <Text className="ml-2 text-lg text-bgDefault font-semibold">
                  Add New
                </Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-4">
              {user?.driver?.bankDetails && user?.driver?.bankDetails.length > 0 ? user.driver.bankDetails.map((bankItem) => (
                <BankAccountCard bankItem={bankItem} key={bankItem.id.toString()} />
              )) : null}
            </View>
          </View>

          {/* Recent Transactions */}
          <View className="mb-8">
            <Text className="font-['Inter-Bold'] text-lg mb-4">
              Recent Transactions
            </Text>
            <View className="space-y-4">
              {user?.walletHistories && user.walletHistories.length > 0 ? (
                user.walletHistories.map((log) => (
                  <WalletCard
                    key={log.id}
                    amount={log.amount}
                    date={log.created_at}
                    fundType={log.dstatus as TransactionWalletType}
                    status={log.dstatus as TransactionWalletStatus}
                  />
                ))
              ) : (
                <Text className="text-center justify-center  tems-center text-sm text-gray-500">
                  No record
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default DriverWallet;
