import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
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
import { router } from 'expo-router';

interface Transaction {
  id: string;
  type: 'withdrawal' | 'earning' | 'bonus';
  amount: number;
  description: string;
  date: string;
  status: 'successful' | 'pending' | 'failed';
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'withdrawal',
    amount: -2500,
    description: 'Widthrawed',
    date: 'Today, 1:15 PM',
    status: 'successful',
  },
  {
    id: '2',
    type: 'earning',
    amount: 5000,
    description: 'Trip Earning',
    date: 'Yesterday, 3:30 PM',
    status: 'successful',
  },
  {
    id: '3',
    type: 'bonus',
    amount: 1000,
    description: 'Weekly Bonus',
    date: 'Dec 15, 2024',
    status: 'successful',
  },
];

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'Access Bank',
    accountNumber: '0123456789',
    accountName: 'John Doe',
    isDefault: true,
  },
  {
    id: '2',
    bankName: 'GTBank',
    accountNumber: '9876543210',
    accountName: 'John Doe',
    isDefault: false,
  },
];

export default function DriverWallet() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'withdrawal' | 'earning'>('all');

  const weeklyEarnings = 158500;
  const availableForWithdrawal = 45000;

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'withdrawal') return transaction.type === 'withdrawal';
    if (filter === 'earning') return transaction.type === 'earning' || transaction.type === 'bonus';
    return true;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return <MaterialCommunityIcons name="arrow-up" size={20} color="#EF4444" />;
      case 'earning':
        return <MaterialCommunityIcons name="arrow-down" size={20} color="#10B981" />;
      case 'bonus':
        return <Ionicons name="gift" size={20} color="#F59E0B" />;
      default:
        return <MaterialCommunityIcons name="arrow-up" size={20} color="#6B7280" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? '#10B981' : '#EF4444';
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Weekly Earnings */}
        <View className="items-center py-8">
          <Text className="text-lg mb-2" style={{ color: colors.text + '80' }}>
            This Week's Earnings
          </Text>
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>
            {NAIRA}{formatCurrency(weeklyEarnings)}
          </Text>
          <TouchableOpacity className="mt-2" onPress={onRefresh}>
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
            onPress={() => router.push('/(root)/driver-withdraw-fund')}
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
            <TouchableOpacity 
              onPress={() => router.push("/(root)/bank-account")}
              className="flex-row items-center"
            >
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

        {/* Transaction Filters */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Recent Transactions
          </Text>
          <View className="flex-row gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'withdrawal', label: 'Withdrawals' },
              { key: 'earning', label: 'Earnings' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setFilter(item.key as any)}
                className={`px-4 py-2 rounded-full ${
                  filter === item.key ? 'bg-teal-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filter === item.key ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        <View className="mx-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} classStyle="mb-3 p-4">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {getTransactionIcon(transaction.type)}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.text }}>
                    {transaction.description}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text + '60' }}>
                    {transaction.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: getTransactionColor(transaction.amount) }}
                  >
                    {transaction.amount > 0 ? '+' : ''}{NAIRA}{formatCurrency(Math.abs(transaction.amount))}
                  </Text>
                  <Text className={`text-xs capitalize ${
                    transaction.status === 'successful' ? 'text-green-600' :
                    transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
            </Card>
          ))}

          {filteredTransactions.length === 0 && (
            <Card classStyle="p-8 items-center">
              <MaterialCommunityIcons name="receipt" size={48} color={colors.text + '40'} />
              <Text className="text-center mt-4 text-base" style={{ color: colors.text }}>
                No transactions found
              </Text>
              <Text className="text-center mt-2 text-sm" style={{ color: colors.text + '60' }}>
                Your transaction history will appear here
              </Text>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <Button
              title="Withdraw Funds"
              onPress={() => router.push('/(root)/driver-withdraw-fund')}
              icon={<MaterialCommunityIcons name="bank-transfer-out" size={20} color="white" />}
              classStyle="flex-1"
              style={{ backgroundColor: colors.primary }}
            />
            <Button
              title="Add Bank"
              onPress={() => router.push('/(root)/add-bank-account')}
              variant="outline"
              icon={<FontAwesome name="bank" size={18} color={colors.primary} />}
              classStyle="flex-1"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
