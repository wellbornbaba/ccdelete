import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { postAPI } from '@/utils/fetch';
import { useAuthStore } from '@/store/useAuthStore';
import { ZodChecker } from '@/utils';
import { Card } from '@/components/ui/Card';
import BankAccountCard from '@/components/ui/BankAccountCard';

const BankAccount = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    accountType: 'savings',
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddBankAccount = async () => {
    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setIsLoading(true);

      const userDataString = await postAPI(
        `/api/users/${user?.id}/bank-account`,
        {
          id: user?.id,
          ...formData,
        },
      );

      if (ZodChecker(userDataString)) {
        return;
      }

      if (userDataString.success) {
        Toast.show({
          type: 'success',
          text1: 'Bank account added successfully',
        });
        setFormData({
          bankName: '',
          accountNumber: '',
          accountName: '',
          accountType: 'savings',
        });
        setShowAddForm(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to add bank account',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Bank Account Details'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Your Bank Accounts
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddForm(!showAddForm)}
              className="flex-row items-center"
            >
              <Feather name="plus" size={20} color={colors.primary} />
              <Text className="ml-2 text-base font-medium" style={{ color: colors.primary }}>
                Add New
              </Text>
            </TouchableOpacity>
          </View>

          {/* Existing Bank Accounts */}
          {user?.driver?.bankDetails && user.driver.bankDetails.length > 0 ? (
            user.driver.bankDetails.map((bankItem) => (
              <BankAccountCard bankItem={bankItem} key={bankItem.id.toString()} />
            ))
          ) : (
            <Card classStyle="p-6 items-center">
              <FontAwesome name="bank" size={48} color={colors.text + '40'} />
              <Text className="text-center mt-4 text-base" style={{ color: colors.text }}>
                No bank accounts added yet
              </Text>
              <Text className="text-center mt-2 text-sm" style={{ color: colors.text + '80' }}>
                Add a bank account to receive payments
              </Text>
            </Card>
          )}

          {/* Add New Bank Account Form */}
          {showAddForm && (
            <Card classStyle="p-4 mt-4">
              <Text className="text-base font-medium mb-4" style={{ color: colors.text }}>
                Add New Bank Account
              </Text>
              
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChangeText={(text) => handleChange('bankName', text)}
                placeholder="Enter bank name"
                icon={<FontAwesome name="bank" size={20} color={colors.text + '80'} />}
              />

              <Input
                label="Account Number"
                value={formData.accountNumber}
                onChangeText={(text) => handleChange('accountNumber', text)}
                placeholder="Enter account number"
                keyboardType="numeric"
                icon={<Feather name="credit-card" size={20} color={colors.text + '80'} />}
              />

              <Input
                label="Account Name"
                value={formData.accountName}
                onChangeText={(text) => handleChange('accountName', text)}
                placeholder="Enter account holder name"
                icon={<Feather name="user" size={20} color={colors.text + '80'} />}
              />

              <View className="flex-row gap-2 mt-4">
                <Button
                  title="Cancel"
                  onPress={() => setShowAddForm(false)}
                  variant="outline"
                  classStyle="flex-1"
                />
                <Button
                  title="Add Account"
                  onPress={handleAddBankAccount}
                  isLoading={isLoading}
                  classStyle="flex-1"
                />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BankAccount;