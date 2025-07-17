import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import useLocation from '@/hooks/useLocation';
import { Location, Passenger } from '@/types';
import { useRideStore } from '@/store/useRideStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';


export default function CreateRideScreen() {
  const { user} = useAuthStore()
   const params = useLocalSearchParams();
    const { typeOfRideid } = params;
  const { colors } = useThemeStore();
  const router = useRouter();
  const { location: currentLocation, address: currentAddress } = useLocation();

  if (!typeOfRideid || !user) {
    return router.back();
  }
  // State for ride details
  const [origin, setOrigin] = useState<Location>({
    lat: 0,
    lng: 0,
    address: '',
  });
  const [destination, setDestination] = useState<Location>({
    lat: 0,
    lng: 0,
    address: '',
  });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toTimeString().split(' ')[0].substr(0, 5)
  );
  const [fare, setFare] = useState('0.00');
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: '123456', displayName: 'John Doe' }, // Current user
  ]);
  const [inviteEmail, setInviteEmail] = useState('');

  // Set current location as origin
  useEffect(() => {
    if (currentLocation && currentAddress) {
      setOrigin({
        lat: currentLocation.coords.lat,
        lng: currentLocation.coords.lng,
        address: currentAddress,
      });
    }
  }, [currentLocation, currentAddress]);

  const handleCreateRide = async () => {
    try {
      if (!origin.address || !destination.address || !date || !time) {
        // Show error
        return;
      }

      // Combine date and time into a timestamp
      const combinedDate = new Date(`${date}T${time}`).getTime();

      // await createRide({
      //   origin,
      //   destination,
      //   date: combinedDate,
      //   fare: parseFloat(fare),
      // });

      // router.push('/(tabs)');
    } catch (error) {
      console.error('Failed to create ride:', error);
    }
  };

  const handleAddPassenger = () => {
    if (!inviteEmail) return;

    // In a real app, you would send an invitation and add the user when they accept
    // For demo purposes, we'll add a mock passenger
    const newPassenger: Passenger = {
      id: `user-${Date.now()}`,
      displayName: inviteEmail.split('@')[0], // Use part of the email as a name
    };

    setPassengers([...passengers, newPassenger]);
    setInviteEmail('');
  };

  const handleRemovePassenger = (id: string) => {
    setPassengers(passengers.filter((p) => p.id !== id));
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="flex-row justify-center items-center pt-16 pb-4 px-4 relative"
        style={{ backgroundColor: colors.card }}
      >
        <Text
          className="text-lg font-semibold"
          style={{ color: colors.text, fontFamily: 'Poppins-SemiBold' }}
        >
          Create New Ride
        </Text>
        <TouchableOpacity
          className="absolute right-4 top-16 p-1"
          onPress={() => router.back()}
        >
          <FontAwesome5 name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-4 pb-24" keyboardShouldPersistTaps="handled">
        <Card classStyle="mb-4">
          {/* Location Inputs */}
          <View className="mb-4">
            <View className="flex-row">
              <View className="w-6 mt-8 items-center">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <View
                  className="w-0.5 h-8 my-1"
                  style={{ backgroundColor: colors.border }}
                />
              </View>
              <Input
                value={origin.address || ''}
                onChangeText={(text) => setOrigin({ ...origin, address: text })}
                placeholder="Enter pickup location"
                label="From"
                classStyle="flex-1"
              />
            </View>

            <View className="flex-row">
              <View className="w-6 mt-8 items-center">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.secondary }}
                />
              </View>
              <Input
                value={destination.address || ''}
                onChangeText={(text) =>
                  setDestination({ ...destination, address: text })
                }
                placeholder="Enter destination"
                label="To"
                classStyle="flex-1"
              />
            </View>
          </View>

          {/* Date and Time */}
          <View className="flex-row mb-4">
            <Input
              value={date}
              onChangeText={setDate}
              placeholder="Date"
              label="Date"
              icon={
                <Feather name="calendar" size={20} color={colors.text + '80'} />
              }
              classStyle="flex-2 mr-2"
            />
            <Input
              value={time}
              onChangeText={setTime}
              placeholder="Time"
              label="Time"
              classStyle="flex-1"
            />
          </View>

          {/* Estimated Fare */}
          <Input
            value={fare}
            onChangeText={setFare}
            placeholder="0.00"
            label="Estimated Fare ($)"
            keyboardType="decimal-pad"
            icon={
              <FontAwesome5
                name="dollar"
                size={20}
                color={colors.text + '80'}
              />
            }
          />
        </Card>

        {/* Passengers */}
        <Card classStyle="mb-4">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.text, fontFamily: 'Poppins-SemiBold' }}
          >
            Passengers
          </Text>

          <View className="mb-4">
            {passengers.map((passenger) => (
              <View
                key={passenger.id}
                className="flex-row justify-between items-center mb-3"
              >
                <View className="flex-row items-center">
                  <Avatar source={passenger.photoURL} name={passenger.displayName} size={36} />
                  <Text
                    className="ml-3 text-base font-medium"
                    style={{ color: colors.text, fontFamily: 'Inter-Medium' }}
                  >
                    {passenger.displayName}
                  </Text>
                </View>
                {passenger.id !== '123456' && (
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.error + '20' }}
                    onPress={() => handleRemovePassenger(passenger.id)}
                  >
                    <FontAwesome5 name="close" size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View className="flex-row items-end">
            <Input
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email to invite"
              classStyle="flex-1 mr-2"
            />
            <TouchableOpacity
              className="w-12 h-12 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary + '20' }}
              onPress={handleAddPassenger}
            >
              <Feather name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200"
        style={{ backgroundColor: colors.card }}
      >
        <Button
          title="Create Ride"
          onPress={handleCreateRide}
          isLoading={isLoading}
          icon={<FontAwesome5 name="check-circle" size={20} color="#FFFFFF" />}
          size="lg"
          classStyle="rounded-xl"
        />
      </View>
    </View>
  );
}
