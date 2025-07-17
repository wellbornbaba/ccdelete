import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DashboardPagesHeader } from './ui/Header';
import { Button } from './ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency, InputAmountFormater } from '@/utils';
import { TransactionWalletStatus, TransactionWalletType } from '@/types';
import { NAIRA } from '@/utils/fetch';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import WalletCard from './ui/WalletCard';
import { bgPrimarColor } from '@/utils/colors';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { useThemeStore } from '@/store/useThemeStore';

const RiderWallet = () => {
  const user = useAuthStore((state) => state.user);
  const [amount, setAmount] = useState('');
  // Quick amount selection options
  const quickAmounts = ['1000', '2000', '5000', '10000'];

  const handleAmount = (amountInput: string) => {
    const formatedAmount = InputAmountFormater(amountInput).valueConverted;
    setAmount(formatedAmount.toString());
  };

  return (
    <>
      <DashboardPagesHeader onBack={true} centerElement={'Wallet'} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="my-8 flex-1">
          {/* Balance Section */}
          <View className="flex flex-col items-center my-4 mb-8">
            <Text className="text-gray-500 mb-1 text-lg">
              Available Balance
            </Text>
            <View className="flex items-center">
              <Text className="text-4xl font-bold font-['Inter-Bold']">
                {NAIRA}
                {formatCurrency(user?.walletBalance || 0)}
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
          <View className="flex-row gap-2">
            <Button
              classStyle="flex-1 py-2 bg-bgDefault"
              title="Add Money"
              // style={{backgroundColor: colors.background,  paddingVertical: 32}}
              onPress={() => {}}
              icon={<Feather name="plus" size={20} color={'white'} />}
            />

            <Button
              variant="outline"
              classStyle="flex-1 text-bgDefault py-2"
              title="Send Money"
              onPress={() => {}}
              icon={
                <FontAwesome5
                  name="exchange-alt"
                  size={20}
                  color={bgPrimarColor}
                />
              }
            />
          </View>

          {/* Fund Wallet Section */}
          <View className="my-12">
            <Text className="font-['Inter-Bold'] text-lg mb-4">
              Fund Wallet
            </Text>
            <Card classStyle="border-0 shadow-none">
              <View className="mb-4">
                <Input
                  label="Amount"
                  value={amount}
                  onChangeText={(text) => handleAmount(text)}
                  placeholder="1000"
                  keyboardType="numeric"
                  classStyle="mb-2"
                  inputStyle={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    height: 65,
                  }}
                />
              </View>

              <View className="flex-row flex-wrap gap-2 mb-4">
                {quickAmounts.map((amountItem) => (
                  <Button
                    key={amountItem}
                    variant="outline"
                    classStyle="min-w-[45%]"
                    title={`${NAIRA}${formatCurrency(amountItem)}`}
                    onPress={() => handleAmount(amountItem)}
                    size="sm"
                  />
                ))}
              </View>

              <Button
                classStyle="w-full  bg-teal-700 hover:bg-teal-800"
                title="Fund with PayStack"
                onPress={() => console.log('yes')}
                icon={<Feather name="credit-card" size={20} color={'white'} />}
              />
            </Card>
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

export default RiderWallet;
