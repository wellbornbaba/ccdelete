import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '../ui/Avatar';
import { useThemeStore } from '@/store/useThemeStore';
import { useRideStore } from '@/store/useRideStore';
import { Passenger, Ride } from '@/types';
import { Feather, Ionicons } from '@expo/vector-icons';

interface BillCalculatorProps {
  ride: Ride;
  onComplete: () => void;
}

export function BillCalculator({ ride, onComplete }: BillCalculatorProps) {
  const { colors } = useThemeStore();
  const { calculateFareSplit, completeRide } = useRideStore();
  
  const [totalFare, setTotalFare] = useState(ride.fare.toFixed(2));
  const [tipPercentage, setTipPercentage] = useState(15);
  const [tip, setTip] = useState('0.00');
  const [passengerShares, setPassengerShares] = useState<{ [key: string]: number }>({});
  const [customTip, setCustomTip] = useState(false);
  
  // Calculate tip amount when tip percentage changes
  useEffect(() => {
    if (!customTip) {
      const tipAmount = (parseFloat(totalFare) * tipPercentage) / 100;
      setTip(tipAmount.toFixed(2));
    }
  }, [tipPercentage, totalFare, customTip]);
  
  // Calculate passenger shares when total or tip changes
  useEffect(() => {
    const calculateShares = async () => {
      const total = parseFloat(totalFare);
      const tipAmount = parseFloat(tip);
      const updatedRide = { ...ride, fare: total, tip: tipAmount };
      
      const shares = await calculateFareSplit(ride.id);
      setPassengerShares(shares);
    };
    
    calculateShares();
  }, [totalFare, tip, ride, calculateFareSplit]);
  
  const handleTipChange = (text: string) => {
    setCustomTip(true);
    // Remove any non-numeric characters except decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    setTip(numericValue);
  };
  
  const handleTipPercentageChange = (percentage: number) => {
    setCustomTip(false);
    setTipPercentage(percentage);
  };
  
  const handleCompleteBill = async () => {
    await completeRide(ride.id, parseFloat(tip));
    onComplete();
  };
  
  const totalWithTip = (parseFloat(totalFare) + parseFloat(tip)).toFixed(2);
  
  return (
    <View className="flex-1">
      <ScrollView>
        <Card classStyle="mb-4">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Ride Fare
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-semibold mr-2" style={{ color: colors.text }}>
              $
            </Text>
            <Input
              value={totalFare}
              onChangeText={setTotalFare}
              keyboardType="numeric"
              classStyle="flex-1"
              inputStyle={{ fontSize: 28, fontWeight: '600' }}
            />
          </View>
        </Card>
  
        <Card classStyle="mb-4">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Tip Amount
          </Text>
          <View className="mb-2">
            <View className="flex-row items-center mb-4">
              <Feather name="dollar-sign" size={24} color={colors.text} className="mr-2" />
              <Input
                value={tip}
                onChangeText={handleTipChange}
                keyboardType="numeric"
                classStyle="flex-1"
              />
            </View>
  
            <View className="flex-row justify-between">
              {[10, 15, 20, 25].map((percent) => {
                const isActive = tipPercentage === percent && !customTip;
                return (
                  <TouchableOpacity
                    key={percent}
                    className={`p-3 rounded-lg items-center justify-center w-[22%] ${
                      isActive ? 'bg-primary/30' : ''
                    }`}
                    onPress={() => handleTipPercentageChange(percent)}
                  >
                    <Text
                      className={`font-semibold ${
                        isActive ? 'text-primary' : ''
                      }`}
                      style={{ color: colors.text }}
                    >
                      {percent}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>
  
        <Card classStyle="mb-4">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Split Bill
          </Text>
          <View className="mb-4">
            {ride.passengers.map((passenger: Passenger) => (
              <View
                key={passenger.id}
                className="flex-row justify-between items-center mb-3"
              >
                <View className="flex-row items-center">
                  <Avatar source={`${passenger.photoURL}`} name={passenger.displayName} size={32} />
                  <Text className="ml-2 text-base" style={{ color: colors.text }}>
                    {passenger.displayName}
                  </Text>
                </View>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  ${passengerShares[passenger.id] ? passengerShares[passenger.id].toFixed(2) : '0.00'}
                </Text>
              </View>
            ))}
          </View>
  
          <View className="h-[1px] bg-gray-200 my-4" />
  
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Total with Tip:
            </Text>
            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
              ${totalWithTip}
            </Text>
          </View>
        </Card>
      </ScrollView>
  
      <View className="p-4">
        <Button
          title="Complete Payment"
          onPress={handleCompleteBill}
          icon={<Ionicons name="calculator-outline" size={24} color="#FFFFFF" />}
          size="lg"
          classStyle="rounded-xl"
        />
      </View>
    </View>
  );
  
}
