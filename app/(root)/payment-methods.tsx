import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/Card';
import { bgPrimarColor } from '@/utils/colors';

const PaymentMethods = () => {
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  // Mock payment methods
  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ];

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPaymentMethod = () => {
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all fields',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Payment method added successfully',
    });
    setShowAddForm(false);
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    });
  };

  const handleSetDefault = (methodId: string) => {
    Toast.show({
      type: 'success',
      text1: 'Default payment method updated',
    });
  };

  const handleRemoveMethod = (methodId: string) => {
    Toast.show({
      type: 'success',
      text1: 'Payment method removed',
    });
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <MaterialIcons name="credit-card" size={24} color="#1a1f71" />;
      case 'mastercard':
        return <MaterialIcons name="credit-card" size={24} color="#eb001b" />;
      default:
        return <MaterialIcons name="credit-card" size={24} color={colors.text} />;
    }
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Payment Methods'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Your Payment Methods
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

          {/* Existing Payment Methods */}
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <Card key={method.id} classStyle="p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {getCardIcon(method.brand)}
                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-medium" style={{ color: colors.text }}>
                          {method.brand} •••• {method.last4}
                        </Text>
                        {method.isDefault && (
                          <View className="ml-2 px-2 py-1 rounded-full bg-green-100">
                            <Text className="text-xs font-medium text-green-800">Default</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm mt-1" style={{ color: colors.text + '80' }}>
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center ml-4">
                    {!method.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(method.id)}
                        className="mr-3"
                      >
                        <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                          Set Default
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleRemoveMethod(method.id)}>
                      <Feather name="trash-2" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card classStyle="p-6 items-center">
              <MaterialIcons name="credit-card" size={48} color={colors.text + '40'} />
              <Text className="text-center mt-4 text-base" style={{ color: colors.text }}>
                No payment methods added yet
              </Text>
              <Text className="text-center mt-2 text-sm" style={{ color: colors.text + '80' }}>
                Add a payment method to make bookings easier
              </Text>
            </Card>
          )}

          {/* Add New Payment Method Form */}
          {showAddForm && (
            <Card classStyle="p-4 mt-4">
              <Text className="text-base font-medium mb-4" style={{ color: colors.text }}>
                Add New Payment Method
              </Text>
              
              {/* Payment Method Type Selector */}
              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={() => setSelectedMethod('card')}
                  className={`flex-1 p-3 rounded-lg mr-2 ${
                    selectedMethod === 'card' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    <MaterialIcons name="credit-card" size={20} color={bgPrimarColor} />
                    <Text className="ml-2 font-medium" style={{ color: colors.text }}>
                      Card
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setSelectedMethod('paypal')}
                  className={`flex-1 p-3 rounded-lg ml-2 ${
                    selectedMethod === 'paypal' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="logo-paypal" size={20} color={bgPrimarColor} />
                    <Text className="ml-2 font-medium" style={{ color: colors.text }}>
                      PayPal
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {selectedMethod === 'card' && (
                <>
                  <Input
                    label="Card Number"
                    value={formData.cardNumber}
                    onChangeText={(text) => handleChange('cardNumber', text)}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="numeric"
                    icon={<MaterialIcons name="credit-card" size={20} color={colors.text + '80'} />}
                  />

                  <View className="flex-row gap-3">
                    <Input
                      label="Expiry Date"
                      value={formData.expiryDate}
                      onChangeText={(text) => handleChange('expiryDate', text)}
                      placeholder="MM/YY"
                      keyboardType="numeric"
                      classStyle="flex-1"
                      icon={<Feather name="calendar" size={20} color={colors.text + '80'} />}
                    />

                    <Input
                      label="CVV"
                      value={formData.cvv}
                      onChangeText={(text) => handleChange('cvv', text)}
                      placeholder="123"
                      keyboardType="numeric"
                      classStyle="flex-1"
                      icon={<Feather name="lock" size={20} color={colors.text + '80'} />}
                    />
                  </View>

                  <Input
                    label="Cardholder Name"
                    value={formData.cardholderName}
                    onChangeText={(text) => handleChange('cardholderName', text)}
                    placeholder="John Doe"
                    icon={<Feather name="user" size={20} color={colors.text + '80'} />}
                  />
                </>
              )}

              {selectedMethod === 'paypal' && (
                <View className="p-4 bg-gray-50 rounded-lg">
                  <Text className="text-center" style={{ color: colors.text }}>
                    You'll be redirected to PayPal to complete the setup
                  </Text>
                </View>
              )}

              <View className="flex-row gap-2 mt-4">
                <Button
                  title="Cancel"
                  onPress={() => setShowAddForm(false)}
                  variant="outline"
                  classStyle="flex-1"
                />
                <Button
                  title="Add Method"
                  onPress={handleAddPaymentMethod}
                  classStyle="flex-1"
                />
              </View>
            </Card>
          )}

          {/* Security Info */}
          <Card classStyle="p-4 mt-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text className="text-base font-medium ml-3" style={{ color: colors.text }}>
                Secure Payments
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.text + '80' }}>
              Your payment information is encrypted and secure. We use industry-standard 
              security measures to protect your financial data.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentMethods;