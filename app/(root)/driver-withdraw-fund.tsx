import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Feather, 
  Ionicons, 
  MaterialCommunityIcons,
  FontAwesome 
} from '@expo/vector-icons';
import { NAIRA } from '@/utils/fetch';
import { formatCurrency } from '@/utils';
import Toast from 'react-native-toast-message';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  logo: string;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'John Doe',
    isDefault: true,
    logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
  },
  {
    id: '2',
    bankName: 'Access Bank',
    accountNumber: '9876543210',
    accountName: 'John Doe',
    isDefault: false,
    logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
  },
];

export default function DriverWithdrawFund() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankAccount>(mockBankAccounts[0]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);

  const weeklyEarnings = 158500;
  const availableForWithdrawal = 45000;

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid amount',
      });
      return;
    }

    if (parseFloat(withdrawAmount) > availableForWithdrawal) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient funds',
        text2: 'Amount exceeds available balance',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Toast.show({
        type: 'success',
        text1: 'Withdrawal Successful!',
        text2: `₦${formatCurrency(withdrawAmount)} sent to ${selectedBank.bankName}`,
      });
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawNote('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Withdrawal Failed',
        text2: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-4">
        <DashboardPagesHeader onBack={true} centerElement="Driver Earnings" />
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Earnings */}
        <View className="items-center py-8">
          <Text className="text-lg mb-2" style={{ color: colors.text + '80' }}>
            This Week's Earnings
          </Text>
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>
            {NAIRA}{formatCurrency(weeklyEarnings)}
          </Text>
          <TouchableOpacity className="mt-2">
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Available for Withdrawal */}
        <Card classStyle="mx-4 mb-6 p-6" style={{ backgroundColor: colors.primary }}>
          <Text className="text-white text-lg mb-2">
            Available for Withdrawal
          </Text>
          <Text className="text-white text-3xl font-bold mb-4">
            {NAIRA}{formatCurrency(availableForWithdrawal)}
          </Text>
          <TouchableOpacity
            onPress={() => setShowWithdrawModal(true)}
            className="bg-white rounded-lg py-3 px-6 self-start"
          >
            <Text className="font-semibold" style={{ color: colors.primary }}>
              Withdraw Funds
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Bank Accounts */}
        <View className="mx-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Bank Accounts
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Feather name="plus" size={20} color={colors.primary} />
              <Text className="ml-2 font-medium" style={{ color: colors.primary }}>
                Add New
              </Text>
            </TouchableOpacity>
          </View>

          {mockBankAccounts.map((account) => (
            <Card key={account.id} classStyle="mb-3 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
                    <FontAwesome name="bank" size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-base font-semibold" style={{ color: colors.text }}>
                        {account.bankName}
                      </Text>
                      {account.isDefault && (
                        <View className="ml-2 px-2 py-1 rounded-full bg-green-100">
                          <Text className="text-xs font-medium text-green-800">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm mt-1" style={{ color: colors.text + '60' }}>
                      Account Number: {account.accountNumber}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text + '60' }}>
                      Account Name: {account.accountName}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="mx-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Recent Transactions
          </Text>
          
          <Card classStyle="p-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                <MaterialCommunityIcons name="arrow-up" size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  Widthrawed
                </Text>
                <Text className="text-sm" style={{ color: colors.text + '60' }}>
                  Today, 1:15 PM
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-base font-semibold text-red-500">
                  -{NAIRA}2,500.00
                </Text>
                <Text className="text-xs text-green-600">Successful</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Withdraw Fund
            </Text>
            <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Bank Selection */}
            <View className="mb-6">
              <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
                Select Bank Account
              </Text>
              <TouchableOpacity
                onPress={() => setShowBankSelector(true)}
                className="border border-gray-300 rounded-lg p-4 flex-row items-center"
                style={{ borderColor: colors.border }}
              >
                <View className="w-8 h-8 rounded bg-green-600 items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">GT</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium" style={{ color: colors.text }}>
                    {selectedBank.bankName}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text + '60' }}>
                    •••• {selectedBank.accountNumber.slice(-4)}
                  </Text>
                </View>
                <Feather name="chevron-down" size={20} color={colors.text + '60'} />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <Input
              label="Amount"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="0.00"
              keyboardType="numeric"
              icon={<Text style={{ color: colors.text }}>₦</Text>}
            />

            {/* Note Input */}
            <Input
              label="Note (Optional)"
              value={withdrawNote}
              onChangeText={setWithdrawNote}
              placeholder="Add a note"
              multiline
              numberOfLines={3}
            />

            {/* Available Balance Info */}
            <View className="bg-blue-50 p-4 rounded-lg mb-6">
              <Text className="text-sm" style={{ color: colors.text + '80' }}>
                Available Balance: {NAIRA}{formatCurrency(availableForWithdrawal)}
              </Text>
            </View>
          </ScrollView>

          <View className="p-4">
            <Button
              title="Widthdraw Now"
              onPress={handleWithdraw}
              isLoading={isLoading}
              style={{ backgroundColor: colors.primary }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
