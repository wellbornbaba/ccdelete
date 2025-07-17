import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Feather, 
  Ionicons, 
  MaterialIcons,
  FontAwesome 
} from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

interface Bank {
  id: string;
  name: string;
  code: string;
  logo: string;
}

interface AccountType {
  id: string;
  name: string;
  description: string;
}

const nigerianBanks: Bank[] = [
  { id: '1', name: 'Access Bank', code: '044', logo: '🏦' },
  { id: '2', name: 'Zenith Bank', code: '057', logo: '🏦' },
  { id: '3', name: 'GTBank', code: '058', logo: '🏦' },
  { id: '4', name: 'First Bank', code: '011', logo: '🏦' },
  { id: '5', name: 'UBA', code: '033', logo: '🏦' },
  { id: '6', name: 'Fidelity Bank', code: '070', logo: '🏦' },
  { id: '7', name: 'Union Bank', code: '032', logo: '🏦' },
  { id: '8', name: 'Sterling Bank', code: '232', logo: '🏦' },
  { id: '9', name: 'Stanbic IBTC', code: '221', logo: '🏦' },
  { id: '10', name: 'Wema Bank', code: '035', logo: '🏦' },
];

const accountTypes: AccountType[] = [
  { id: '1', name: 'Savings', description: 'Personal savings account' },
  { id: '2', name: 'Current', description: 'Business current account' },
  { id: '3', name: 'Domiciliary', description: 'Foreign currency account' },
];

export default function AddBankAccount() {
  const { colors } = useThemeStore();
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('Ahmed Femi');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  const filteredBanks = nigerianBanks.filter(bank =>
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const handleAccountNumberChange = (text: string) => {
    setAccountNumber(text);
    // Simulate account verification when 10 digits are entered
    if (text.length === 10) {
      setTimeout(() => {
        setIsVerified(true);
        setAccountName('Ahmed Femi');
      }, 1000);
    } else {
      setIsVerified(false);
      setAccountName('');
    }
  };

  const handleAddBankAccount = async () => {
    if (!selectedBank) {
      Toast.show({
        type: 'error',
        text1: 'Please select a bank',
      });
      return;
    }

    if (!selectedAccountType) {
      Toast.show({
        type: 'error',
        text1: 'Please select account type',
      });
      return;
    }

    if (accountNumber.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid 10-digit account number',
      });
      return;
    }

    if (!isVerified) {
      Toast.show({
        type: 'error',
        text1: 'Account verification failed',
        text2: 'Please check your account details',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Toast.show({
        type: 'success',
        text1: 'Bank Account Added Successfully!',
        text2: 'Your account has been verified and added',
      });
      
      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add bank account',
        text2: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBankItem = ({ item }: { item: Bank }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedBank(item);
        setShowBankModal(false);
        setBankSearchQuery('');
      }}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
        <FontAwesome name="bank" size={20} color={colors.primary} />
      </View>
      <Text className="text-base" style={{ color: colors.text }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAccountTypeItem = ({ item }: { item: AccountType }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedAccountType(item);
        setShowAccountTypeModal(false);
      }}
      className="p-4 border-b border-gray-100"
    >
      <Text className="text-base font-medium" style={{ color: colors.text }}>
        {item.name}
      </Text>
      <Text className="text-sm mt-1" style={{ color: colors.text + '60' }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-4">
        <DashboardPagesHeader onBack={true} centerElement="Nigeria Wallet" />
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Card classStyle="mx-4 mt-4 p-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Add Bank Account
            </Text>
            <TouchableOpacity>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Bank Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
              Select Bank
            </Text>
            <View className="relative">
              <Input
                value={selectedBank?.name || ''}
                placeholder="Search banks"
                onFocus={() => setShowBankModal(true)}
                icon={<Feather name="search" size={20} color={colors.text + '60'} />}
                ViewStyle={{ marginBottom: 0 }}
              />
            </View>
          </View>

          {/* Account Type Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
              Account Type
            </Text>
            <TouchableOpacity
              onPress={() => setShowAccountTypeModal(true)}
              className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <Text style={{ color: selectedAccountType ? colors.text : colors.text + '60' }}>
                {selectedAccountType?.name || 'Select Account Type'}
              </Text>
              <Feather name="chevron-down" size={20} color={colors.text + '60'} />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <Input
            label="Account Number"
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
            placeholder="Enter 10-digit account number"
            keyboardType="numeric"
            maxLength={10}
            icon={<Feather name="credit-card" size={20} color={colors.text + '60'} />}
          />

          {/* Account Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
              Account Name
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg p-3" style={{ borderColor: colors.border }}>
              <Text className="flex-1" style={{ color: accountName ? colors.text : colors.text + '60' }}>
                {accountName || 'Account name will appear here'}
              </Text>
              {isVerified && (
                <MaterialIcons name="verified" size={20} color="#4CAF50" />
              )}
            </View>
          </View>

          {/* Security Notice */}
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <View className="flex-row items-start">
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium" style={{ color: colors.text }}>
                  Secure & Encrypted
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.text + '80' }}>
                  Your bank details are encrypted and stored securely
                </Text>
              </View>
            </View>
          </View>

          <Button
            title="Add Bank Account"
            onPress={handleAddBankAccount}
            isLoading={isLoading}
            disabled={!selectedBank || !selectedAccountType || !isVerified}
            style={{ backgroundColor: colors.primary }}
          />
        </Card>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBankModal(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Select Bank
            </Text>
            <TouchableOpacity onPress={() => setShowBankModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <Input
              value={bankSearchQuery}
              onChangeText={setBankSearchQuery}
              placeholder="Search banks"
              icon={<Feather name="search" size={20} color={colors.text + '60'} />}
              ViewStyle={{ marginBottom: 0 }}
            />
          </View>

          <FlatList
            data={filteredBanks}
            renderItem={renderBankItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Account Type Selection Modal */}
      <Modal
        visible={showAccountTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAccountTypeModal(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Select Account Type
            </Text>
            <TouchableOpacity onPress={() => setShowAccountTypeModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={accountTypes}
            renderItem={renderAccountTypeItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
