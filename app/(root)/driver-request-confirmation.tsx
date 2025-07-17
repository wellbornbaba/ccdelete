import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Feather, 
  Ionicons, 
  MaterialCommunityIcons,
  MaterialIcons 
} from '@expo/vector-icons';
import { NAIRA } from '@/utils/fetch';
import { formatCurrency } from '@/utils';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

interface RideRequest {
  id: string;
  passenger: {
    name: string;
    photo: string;
    rating: number;
    phone: string;
  };
  pickup: {
    address: string;
    time: string;
  };
  destination: {
    address: string;
  };
  fare: number;
  distance: string;
  duration: string;
  paymentMethod: 'cash' | 'wallet';
}

const mockRideRequest: RideRequest = {
  id: 'req_123',
  passenger: {
    name: 'Omotola Williams',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    rating: 4.8,
    phone: '+234 801 234 5678',
  },
  pickup: {
    address: 'Victoria Island, Lagos',
    time: '2:30 PM',
  },
  destination: {
    address: 'Lekki Phase 1, Lagos',
  },
  fare: 15500,
  distance: '8.5 km',
  duration: '25 mins',
  paymentMethod: 'wallet',
};

export default function DriverRequestConfirmation() {
  const { colors } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [rideAmount, setRideAmount] = useState('15500');
  const [pickupPoint, setPickupPoint] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('wallet');
  const [rideType, setRideType] = useState('');
  const [waitingTime, setWaitingTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Toast.show({
        type: 'success',
        text1: 'Ride Request Accepted!',
        text2: 'Passenger has been notified',
      });
      
      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to accept request',
        text2: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineRequest = () => {
    Toast.show({
      type: 'error',
      text1: 'Ride Request Declined',
    });
    router.back();
  };

  const handleConfirmParameters = () => {
    setShowParametersModal(false);
    Toast.show({
      type: 'success',
      text1: 'Ride parameters updated',
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-4">
        <DashboardPagesHeader onBack={true} centerElement="Rides Request" />
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Fare Display */}
        <View className="items-center py-6">
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>
            {NAIRA}{formatCurrency(mockRideRequest.fare)}
          </Text>
        </View>

        {/* Passenger Info */}
        <Card classStyle="mx-4 mb-4 p-4">
          <View className="flex-row items-center">
            <Avatar 
              source={mockRideRequest.passenger.photo}
              name={mockRideRequest.passenger.name}
              size={60}
            />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {mockRideRequest.passenger.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text className="ml-1 text-sm" style={{ color: colors.text }}>
                  {mockRideRequest.passenger.rating}
                </Text>
              </View>
              <Text className="text-sm mt-1" style={{ color: colors.text + '80' }}>
                {mockRideRequest.passenger.phone}
              </Text>
            </View>
            <TouchableOpacity 
              className="p-3 rounded-full"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Feather name="phone" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Trip Details */}
        <Card classStyle="mx-4 mb-4 p-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Trip Details
          </Text>
          
          {/* Pickup */}
          <View className="flex-row items-start mb-4">
            <View className="w-6 items-center">
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <View className="w-0.5 h-6 bg-gray-300 mt-1" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs" style={{ color: colors.text + '60' }}>
                Pickup • {mockRideRequest.pickup.time}
              </Text>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {mockRideRequest.pickup.address}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View className="flex-row items-start">
            <View className="w-6 items-center">
              <Ionicons name="location" size={20} color="#F44336" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs" style={{ color: colors.text + '60' }}>
                Destination
              </Text>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {mockRideRequest.destination.address}
              </Text>
            </View>
          </View>

          {/* Trip Metrics */}
          <View className="flex-row justify-between mt-6 pt-4 border-t border-gray-200">
            <View className="items-center">
              <Text className="text-xs" style={{ color: colors.text + '60' }}>Distance</Text>
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {mockRideRequest.distance}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs" style={{ color: colors.text + '60' }}>Duration</Text>
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {mockRideRequest.duration}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs" style={{ color: colors.text + '60' }}>Payment</Text>
              <View className="flex-row items-center">
                <Ionicons 
                  name={mockRideRequest.paymentMethod === 'wallet' ? 'wallet' : 'cash'} 
                  size={16} 
                  color={colors.primary} 
                />
                <Text className="text-base font-semibold ml-1 capitalize" style={{ color: colors.text }}>
                  {mockRideRequest.paymentMethod}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Set Ride Parameters Button */}
        <TouchableOpacity
          onPress={() => setShowParametersModal(true)}
          className="mx-4 mb-6"
        >
          <Card classStyle="p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  Set Ride Parameters
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.text + '60' }}>
                  Customize ride settings
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.text + '60'} />
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 pb-4 flex-row gap-3">
        <Button
          title="Cancel"
          onPress={handleDeclineRequest}
          variant="outline"
          classStyle="flex-1"
        />
        <Button
          title="Confirm"
          onPress={handleAcceptRequest}
          isLoading={isLoading}
          classStyle="flex-1"
          style={{ backgroundColor: colors.primary }}
        />
      </View>

      {/* Set Parameters Modal */}
      <Modal
        visible={showParametersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowParametersModal(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
          <View className="px-4">
            <DashboardPagesHeader 
              onBack={true} 
              onBackHandle={() => setShowParametersModal(false)}
              centerElement="Set Ride Parameters" 
            />
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <Input
              label="Set Ride Amount"
              value={rideAmount}
              onChangeText={setRideAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              icon={<Text style={{ color: colors.text }}>₦</Text>}
            />

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                Select Pickup Point
              </Text>
              <TouchableOpacity 
                className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: pickupPoint ? colors.text : colors.text + '60' }}>
                  {pickupPoint || 'Select location'}
                </Text>
                <Feather name="chevron-down" size={20} color={colors.text + '60'} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
                Payment Method
              </Text>
              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => setPaymentMethod('cash')}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-teal-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cash' && (
                      <View className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    )}
                  </View>
                  <Text style={{ color: colors.text }}>Cash on Boarding</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setPaymentMethod('wallet')}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    paymentMethod === 'wallet' ? 'border-teal-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'wallet' && (
                      <View className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    )}
                  </View>
                  <Text style={{ color: colors.text }}>Instant Wallet Payment</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                Ride Type
              </Text>
              <TouchableOpacity 
                className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: rideType ? colors.text : colors.text + '60' }}>
                  {rideType || 'Select ride type'}
                </Text>
                <Feather name="chevron-down" size={20} color={colors.text + '60'} />
              </TouchableOpacity>
            </View>

            <Input
              label="Maximum Waiting Time (minutes)"
              value={waitingTime}
              onChangeText={setWaitingTime}
              placeholder="Enter minutes"
              keyboardType="numeric"
            />

            <Input
              label="Additional Notes"
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="Add any special instructions"
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <View className="px-4 pb-4 flex-row gap-3">
            <Button
              title="Cancel"
              onPress={() => setShowParametersModal(false)}
              variant="outline"
              classStyle="flex-1"
            />
            <Button
              title="Confirm"
              onPress={handleConfirmParameters}
              classStyle="flex-1"
              style={{ backgroundColor: colors.primary }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}