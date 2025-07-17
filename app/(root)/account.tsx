import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { RideCard } from '@/components/rides/RideCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useRideStore } from '@/store/useRideStore';
import { AntDesign, Feather } from '@expo/vector-icons';

export default function AccountScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const { colors, gradients } = useThemeStore();
  const { rides } = useRideStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.firstName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Get completed rides count
  const completedRides = rides.filter(ride => ride.status === 'completed').length;
  
  // Get recent rides (max 2)
  const recentRides = rides
    .filter(ride => ride.status === 'completed')
    .sort((a, b) => b.date - a.date)
    .slice(0, 2);
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        displayName,
        phoneNumber,
        email,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };
  
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={["#000000", "#434343"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-10 px-4 items-center"
      >
        {/* Avatar */}
        <View className="relative mb-4">
          <Image
            source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
            className="w-24 h-24 rounded-full border-4"
            style={{ borderColor: 'rgba(255,255,255,0.8)' }}
          />
          <TouchableOpacity
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.card }}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.8 : 1}
          >
            <Feather name="camera" size={18} color={isEditing ? colors.primary : colors.text + '40'} />
          </TouchableOpacity>
        </View>
  
        {/* Name */}
        <Text
          className="text-white text-2xl font-bold mb-4"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          {user?.firstName || 'User'}
        </Text>
  
        {/* Stats */}
        <View className="flex-row rounded-xl px-6 py-4 w-full" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          {/* Rides */}
          <View className="flex-1 items-center">
            <Text className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'Poppins-Bold' }}>
              {completedRides}
            </Text>
            <Text className="text-white/80 text-sm" style={{ fontFamily: 'Inter-Regular' }}>
              Rides
            </Text>
          </View>
  
          {/* Divider */}
          <View className="w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
  
          {/* Miles */}
          <View className="flex-1 items-center">
            <Text className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'Poppins-Bold' }}>
              {rides.reduce((sum, ride) => sum + ride.distance, 0).toFixed(0)}
            </Text>
            <Text className="text-white/80 text-sm" style={{ fontFamily: 'Inter-Regular' }}>
              Miles
            </Text>
          </View>
  
          {/* Divider */}
          <View className="w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
  
          {/* Upcoming */}
          <View className="flex-1 items-center">
            <Text className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'Poppins-Bold' }}>
              {rides.filter(ride => ride.status === 'scheduled').length}
            </Text>
            <Text className="text-white/80 text-sm" style={{ fontFamily: 'Inter-Regular' }}>
              Upcoming
            </Text>
          </View>
        </View>
      </LinearGradient>
  
      {/* Profile Info */}
      <Card classStyle="mx-4 mt-0 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-lg font-semibold"
            style={{ fontFamily: 'Poppins-SemiBold', color: colors.text }}
          >
            Personal Information
          </Text>
  
          {isEditing ? (
            <Button title="Save" onPress={handleSaveProfile} variant="outline" size="sm" />
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2">
              <Feather name="edit" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
  
        <View className="mb-2">
          {isEditing ? (
            <>
              <Input
                label="Full Name"
                value={displayName}
                onChangeText={setDisplayName}
                icon={<Feather name="user" size={18} color={colors.text + '80'} />}
              />
              <Input
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                icon={<Feather name="phone" size={18} color={colors.text + '80'} />}
              />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                disabled
                icon={<Feather name="mail" size={18} color={colors.text + '80'} />}
              />
            </>
          ) : (
            <>
              {/* Full Name */}
              <View className="flex-row items-center mb-4">
                <Feather name="user" size={18} color={colors.text + '80'} />
                <View className="ml-3 flex-1">
                  <Text className="text-xs mb-1" style={{ color: colors.text + '80', fontFamily: 'Inter-Regular' }}>
                    Full Name
                  </Text>
                  <Text className="text-base font-medium" style={{ color: colors.text, fontFamily: 'Inter-Medium' }}>
                    {user?.firstName || 'Not set'}
                  </Text>
                </View>
              </View>
  
              {/* Phone */}
              <View className="flex-row items-center mb-4">
                <Feather name="phone" size={18} color={colors.text + '80'} />
                <View className="ml-3 flex-1">
                  <Text className="text-xs mb-1" style={{ color: colors.text + '80', fontFamily: 'Inter-Regular' }}>
                    Phone Number
                  </Text>
                  <Text className="text-base font-medium" style={{ color: colors.text, fontFamily: 'Inter-Medium' }}>
                    {user?.phoneNumber || 'Not set'}
                  </Text>
                </View>
              </View>
  
              {/* Email */}
              <View className="flex-row items-center mb-4">
                <Feather name="mail" size={18} color={colors.text + '80'} />
                <View className="ml-3 flex-1">
                  <Text className="text-xs mb-1" style={{ color: colors.text + '80', fontFamily: 'Inter-Regular' }}>
                    Email
                  </Text>
                  <Text className="text-base font-medium" style={{ color: colors.text, fontFamily: 'Inter-Medium' }}>
                    {user?.email || 'Not set'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </Card>
  
      {/* Recent Rides */}
      {recentRides.length > 0 && (
        <Card classStyle="mx-4 mt-4 p-4">
          <Text className="text-lg font-semibold mb-2" style={{ color: colors.text, fontFamily: 'Poppins-SemiBold' }}>
            Recent Rides
          </Text>
          {recentRides.map(ride => (
            <RideCard key={ride.id} ride={ride} variant="compact" />
          ))}
        </Card>
      )}
  
      {/* Logout Button */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="outline"
        icon={<AntDesign name="logout" size={18} color={colors.primary} />}
        style={{ marginHorizontal: 16, marginTop: 8 }}
      />
    </ScrollView>
  );
  

}
