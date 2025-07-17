import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpLocation from 'expo-location';
import {
  Ionicons,
  MaterialIcons,
  Feather,
  AntDesign,
} from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  formatCurrency,
  formatDateHuman,
  getLocationByDefault,
  Wordstruncate,
} from '@/utils';
import { BASEURL, NAIRA } from '@/utils/fetch';
import { Ride, RideHistoryBasicProps } from '@/types/vehicle';
import { useRideStore } from '@/store/useRideStore';
import { Redirect, router } from 'expo-router';
import StatusBadge from './ui/StatusBadge';
import AvatarWithStatus from './ui/AvatarWithStatus';
import { useProfileStore } from '@/store/useProfileStore';
import { bgPrimarColor, lightPrimaryColor } from '@/utils/colors';
import { BlinkingBeacon } from './ui/BlinkingBeacon';
import BgLoading from './BgLoading';
import { openURL } from 'expo-linking';
import { TripWs } from '@/lib/TripWs';
import { KeyBoardViewArea } from './ui/KeyBoardViewArea';
import CustomBottomSheet from './CustomBottomSheet';
import { useChatStore } from '@/store/useChatStore';
import { LocationProps, User, UserBasic } from '@/types';
import { useTripTracking } from '@/hooks/useTripTracking';
import { useLanguageStore } from '@/store/useLanguageStore';

// Define MapView type for TypeScript
type MapViewType = {
  animateToRegion: (region: any, duration: number) => void;
  fitToCoordinates: (coordinates: any[], options: any) => void;
};

// Dynamically import MapView ONLY on native platforms
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

// Types and Interfaces
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

const tripOnMove = ['inprogress', 'active'];
const tripEnded = ['completed', 'cancelled'];
const locationInit = {
  address: '',
  lat: 0,
  lng: 0,
};

export default function TripMonitoring() {
  const { colors } = useThemeStore();
  const currentUser = useAuthStore((s) => s.user);
  const setChatUser = useChatStore((s) => s.setChatUser);
  const isSetGlobalLoading = useLanguageStore((s) => s.setIsAppLoading);
  const setUserProfileData = useProfileStore((s) => s.setUserProfileData);
  const trip = useRideStore((s) => s.rideActiveDetail);
  const setRideActiveDetail = useRideStore((s) => s.setRideActiveDetail);
  if (!trip) return <Redirect href={'/(root)/(tabs)'} />;

  const user = trip.user;
  if (Platform.OS == 'web') return <Redirect href={'/(root)/(tabs)'} />;
  if (!user)
    return <BgLoading popup={true} title="Initializing monitoring..." />;

  // State management
  const [passengers, setPassengers] = useState<RideHistoryBasicProps[] | []>(
    trip?.rideHistory || [],
  );
  const [currentLocation, setCurrentLocation] =
    useState<LocationProps>(locationInit);
  const [routeCoordinates, setRouteCoordinates] = useState<LocationData[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [tripProgress, setTripProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleDetail, setToggleDetail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [stopConnection, setStopConnection] = useState(false);

  // Step 1: Fetch current location
  const tripService = new TripWs({
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  });

  const mapRef = useRef<MapViewType | null>(null);
  const locationSubscription = useRef<ExpLocation.LocationSubscription | null>(
    null,
  );
  const [selectedPassenger, setSelectedPassenger] =
    useState<RideHistoryBasicProps | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);

  const handleSelectPassenger = (passenger: RideHistoryBasicProps) => {
    setSelectedPassenger(passenger ?? null);
    setModalVisible(true);
    mapRef.current?.animateToRegion(
      {
        latitude: passenger.current_location?.lat,
        longitude: passenger.current_location?.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000,
    );
  };

  // Initialize trip monitoring
  useEffect(() => {
    // setInterval(() => {
    initializeTripMonitoring();
    // }, 20000);

    return () => {
      cleanup();
    };
  }, []);

  const initializeTripMonitoring = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Start location tracking
      startLocationTracking();
      // Calculate initial route
      await calculateRoute();

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize trip monitoring:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize trip monitoring',
      );
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await ExpLocation.watchPositionAsync(
        {
          accuracy: ExpLocation.Accuracy.High,
          timeInterval: 30000, // Update every 10 seconds
          distanceInterval: 30, // Update every 10 meters
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: Date.now(),
            speed: location.coords.speed || 0,
            heading: location.coords.heading || 0,
          };
          const [address] = await ExpLocation.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setCurrentLocation({
            lat: locationData.latitude,
            lng: locationData.longitude,
            address: address.formattedAddress ?? 'Unknow',
          });
          setCurrentSpeed((location.coords.speed || 0) * 3.6); // Convert m/s to km/h

          // Send location to WebSocket
          // const tripService = new TripWs({
          //   lat: locationData.latitude,
          //   lng: locationData.longitude,
          // });
          tripService.connect(user?.id || '', trip.id);

          tripService.on('tripStarted', (data) => {
            console.log('Trip started!', data);
          });
          tripService.on('locationUpdate', (data) => {
            console.log(data);
            setRideActiveDetail(data);
          });
          tripService.on("tripEnded",(data) => {
            console.log(data);
            const filterPassenger = data.user.rideHistory.filter((item: RideHistoryBasicProps) =>  !tripEnded.includes(`${item?.dstatus}`))
            setRideActiveDetail(filterPassenger);
          })

          tripService.on("tripCancelled",(data) => {
            console.log(data);
            setRideActiveDetail(data);
          })
          tripService.on("tripAllCancalled",(data) => {
            console.log(data);
            setRideActiveDetail(data);
          })

          const tripRes = tripService.sendStartTrip();
          console.log(tripRes);

          // Update trip progress
          // updateTripProgress(locationData);
        },
      );
    } catch (err) {
      console.error('Failed to start location tracking:', err);
      setError('Failed to start location tracking');
    }
  };

  const calculateRoute = async () => {
    try {
      // Mock route calculation - in production, use Google Directions API or similar
      const mockRoute: LocationData[] = [
        {
          latitude: trip.pickup_location?.lat || 0,
          longitude: trip.pickup_location?.lng || 0,
          timestamp: Date.now(),
        },
        {
          latitude: trip.destination_address.lat,
          longitude: trip.destination_address.lng,
          timestamp: Date.now(),
        },
      ];

      setRouteCoordinates(mockRoute);

      // Calculate estimated arrival time
      const estimatedTime = new Date();
      estimatedTime.setMinutes(
        estimatedTime.getMinutes() + Number(trip.ride_time),
      );
      setEstimatedArrival(estimatedTime);
    } catch (err) {
      console.error('Failed to calculate route:', err);
    }
  };

  const centerMapOnBothUsers = (
    d_lat: number,
    d_lng: number,
    p_lat: number,
    p_lng: number,
  ) => {
    if (mapRef.current && trip.pickup_location) {
      const coordinates = [
        {
          latitude: d_lat,
          longitude: d_lng,
        },
        {
          latitude: p_lat,
          longitude: p_lng,
        },
      ];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  const onTripComplete = () => {
    console.log('completed');
    isSetGlobalLoading(true);
    try {
      tripService.sendEndTrip(
        selectedPassenger?.user?.id ?? '',
        selectedPassenger?.id ?? '',
      );
    } catch (error) {
      console.log(error);
    } finally {
      isSetGlobalLoading(false);
    }
  };
  console.log(currentUser?.accountType);
  // console.log(trip.rideHistory);
  console.log(selectedPassenger);

  const onTripCancel = () => {
    console.log('Cancelled');
    isSetGlobalLoading(true);
    try {
      tripService.sendEndTrip(
        selectedPassenger?.user?.id ?? '',
        selectedPassenger?.id ?? '',
      );
    } catch (error) {
      console.log(error);
    } finally {
      isSetGlobalLoading(false);
    }
  };
  const handleCompleteTrip = () => {
    Alert.alert(
      'Complete Trip',
      'Are you sure you want to complete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: () => {
            onTripComplete();
          },
        },
      ],
    );
  };

  const handleCancelTrip = () => {
    Alert.alert('Cancel Trip', 'Are you sure you want to cancel this trip?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          onTripCancel();
        },
      },
    ]);
  };

  const cleanup = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const handleChat = () => {
    // Set the chat user and navigate to chat
    setChatUser(user);
    router.navigate('/(root)/chat');
    console.log('chat');
  };

  const handleCall = () => {
    openURL(`tel:${user.phoneNumber}`);
  };

  const handleDriverProfile = () => {
    if (currentUser?.id === user.id) {
      setUserProfileData(user);
      router.navigate('/(root)/profile');
      return;
    }

    setSelectedDriver(user);
    setModalVisible(true);
  };

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text className="text-base" style={{ color: colors.error }}>
          {error}
        </Text>
        <Button title="Retry" onPress={initializeTripMonitoring} />
      </View>
    );
  }

  const toggleSelectedUser = selectedPassenger
    ? (selectedPassenger.user ?? null)
    : selectedDriver
      ? selectedDriver
      : null;
  return (
    <>
      <SafeAreaView className="flex-1 bg-white relative">
        {/* Map */}
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0 h-full"
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: tripOnMove.includes(trip.dstatus)
              ? trip.current_lat
              : trip.pickup_location?.lat || 0,
            longitude: tripOnMove.includes(trip.dstatus)
              ? trip.current_lat
              : trip.pickup_location?.lng || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={true}
          showsTraffic={true}
          loadingEnabled={true}
        >
          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}

          {passengers.map((p) => (
            <Marker
              key={p.id}
              coordinate={{
                latitude: p.current_location?.lat,
                longitude: p.current_location?.lng,
              }}
              title={`Passenger`}
              description={`${p.user?.firstName} ${p.user?.lastName}`}
            >
              <BlinkingBeacon
                imageSrc={{ uri: `${BASEURL}${p.user?.photoURL}` }}
                name={`${p.user?.firstName}`}
              />
            </Marker>
          ))}

          {/* Pickup Location Marker */}
          <Marker
            coordinate={{
              latitude: tripOnMove.includes(trip.dstatus)
                ? trip.current_lat
                : (trip.pickup_location?.lat ?? 0),
              longitude: tripOnMove.includes(trip.dstatus)
                ? trip.current_lat
                : (trip.pickup_location?.lng ?? 0),
            }}
            title="Driver Pickup Location"
            description={
              tripOnMove.includes(trip.dstatus)
                ? trip.current_lat
                : trip.pickup_location?.address || ''
            }
            pinColor="green"
          >
            <BlinkingBeacon
              imageSrc={{ uri: `${BASEURL}${trip.user?.photoURL}` }}
              name={`${trip.user?.firstName}`}
            />
          </Marker>

          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: trip.destination_address?.lat ?? 0,
              longitude: trip.destination_address?.lng ?? 0,
            }}
            title="Destination"
            description={trip.dest_address}
            pinColor="red"
          />
        </MapView>

        {/* Back Button */}
        <View className="absolute flex-1 top-10 z-10 w-full  gap-3 mt-4">
          <View className="flex-row justify-between items-center mx-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className=" bg-default-900 p-2 rounded-full shadow-md w-12 h-12 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={26} color="#ffffff" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              {/* <StatusBadge status={trip.dstatus} /> */}

              <TouchableOpacity
                onPress={() => {
                  setToggleDetail(!toggleDetail);
                  centerMapOnBothUsers(
                    trip.current_lat ?? 0,
                    trip.current_lng ?? 0,
                    trip.dest_lat ?? 0,
                    trip.dest_lng ?? 0,
                  );
                }}
                className="p-2"
              >
                <MaterialIcons
                  name="my-location"
                  size={24}
                  color={toggleDetail ? colors.primary : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Info Card */}
          {toggleDetail && (
            <View className=" bg-white/80 rounded-2xl p-2 shadow-md mx-4">
              <View className="flex-row items-start gap-2 mb-0">
                <View className="w-6 items-center">
                  <Ionicons name="location-outline" size={16} color="#9ca3af" />
                  <View
                    style={{ backgroundColor: colors.border }}
                    className="w-0.5 h-5 my-0.5"
                  />
                </View>
                <View className="">
                  <Text className="text-xs text-gray-400">
                    Current Location
                  </Text>
                  <Text className="text-sm font-semibold text-gray-800 capitalize">
                    {trip.origin_address.address}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-2 ">
                <Ionicons name="location" size={16} color={'#fca5a5'} />
                <View className="">
                  <Text className="text-xs text-gray-400">Destination</Text>

                  <Text
                    className="text-sm text-gray-700 font-medium capitalize"
                    style={{ color: colors.text }}
                  >
                    {trip.dest_address}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-3">
                <View>
                  <Text className="text-xs text-gray-400">Estimated Time</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {formatDateHuman(
                      trip.ride_time ? new Date(trip.ride_time) : new Date(),
                    )}  mins
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400">Distance</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {(trip.distance ?? 0).toFixed(2)} km
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400">Fare</Text>
                  <Text className="text-sm font-bold text-gray-800">
                    {NAIRA}
                    {formatCurrency(trip.shared_fare_price ?? 0)}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between mt-3">
                <View>
                  <Ionicons
                    name="speedometer"
                    size={16}
                    color={colors.primary}
                  />
                  <Text className="text-xs text-gray-400">Speed</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {currentSpeed.toFixed(0)} km/h
                  </Text>
                </View>

                <View>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text className="text-xs text-gray-400">Progress</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {tripProgress.toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Passenger List Left Side */}
        <View className="absolute left-2 gap-1 bottom-[25%]">
          {passengers.map((item) => (
            <View className="flex-row items-center gap-1" key={item.id}>
              <TouchableOpacity
                onPress={() =>
                  handleSelectPassenger(
                    item as unknown as RideHistoryBasicProps,
                  )
                }
                className="items-center"
              >
                <Avatar
                  source={`${item.user?.photoURL}`}
                  name={`${item.user?.firstName} ${item.user?.lastName}`}
                  size={49}
                  style={{
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                />
              </TouchableOpacity>
              <Text className="text-xs text-gray-700 font-['Inter-Bold']">
                {item.user?.firstName}
              </Text>
            </View>
          ))}
        </View>

        {/* Driver Card */}
        <View
          className="absolute bottom-4 bg-white/40 mx-4 rounded-2xl p-4 shadow-lg flex-row items-center"
          style={{
            bottom: 48,
            position: 'absolute',
            // backgroundColor: "#ffffff98"
          }}
        >
          <TouchableOpacity
            className="flex-row items-start flex-1 "
            onPress={handleDriverProfile}
          >
            <AvatarWithStatus
              photoURL={`${user.photoURL}`}
              fullname={`${user.firstName} ${user.lastName}`}
              size={69}
              status={user.kycScore?.status || 'unverified'}
              statusStyle={{ right: -40, bottom: -3 }}
            />

            <View className="ml-2 flex-1">
              <View className="">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold mr-1 capitalize ">
                    {Wordstruncate(`${user.firstName} ${user.lastName}`, 22)}
                  </Text>
                  <Ionicons
                    name="car-outline"
                    size={15}
                    color={bgPrimarColor}
                  />
                </View>
                <Text className="text-xs text-gray-500">
                  {user.driver?.model} • {user.driver?.interior_color} • 
                  {user.driver?.plate_number}
                </Text>
              </View>
              <View className="flex-row justify-between items-center ">
                <View className="flex-row gap-2">
                  <Text
                    style={{ color: bgPrimarColor }}
                    className="text-xs uppercase self-end"
                  >
                    {user.accountType}
                  </Text>
                  <View className="flex-row">
                    {user.driverStatistic?.starDistribution &&
                      user.driverStatistic.starDistribution.map(
                        (item, _index) => (
                          <Feather
                            key={_index}
                            name="star"
                            size={14}
                            color={
                              item.star <= item.count ? '#FFD700' : '#E0E0E0'
                            }
                            style={{ marginLeft: 2 }}
                          />
                        ),
                      )}
                  </View>
                </View>
                <StatusBadge status={trip.dstatus} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <CustomBottomSheet
        isVisible={modalVisible}
        onClose={() => {
          Keyboard.dismiss();
          // reset();
          // setIsVisible(false);
        }}
        mainClass="h-[36%] w-full"
      >
        <KeyBoardViewArea
          useScroll={true}
          scrollViewProps={{
            showsHorizontalScrollIndicator: false,
            showsVerticalScrollIndicator: false,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
            }}
            className="absolute left-0 top-0"
          >
            <MaterialIcons name="close" size={28} color={bgPrimarColor} />
          </TouchableOpacity>
          <View className="justify-center items-center flex-1 w-full mt-2">
            <TouchableOpacity
              onPress={() => {
                setUserProfileData(toggleSelectedUser);
                router.navigate('/(root)/profile');
              }}
            >
              <AvatarWithStatus
                photoURL={`${toggleSelectedUser?.photoURL}`}
                fullname={`${toggleSelectedUser?.firstName} ${toggleSelectedUser?.lastName}`}
                size={72}
                status={toggleSelectedUser?.kycScore?.status || 'unverified'}
                statusStyle={{ right: -40, bottom: -3 }}
              />
            </TouchableOpacity>

            <View className="justify-center items-center">
              <View className="flex-row">
                <Text
                  style={{
                    color: colors.text,
                  }}
                  className="text-lg capitalize font-['Inter-SemiBold']"
                >
                  {`${toggleSelectedUser?.firstName} ${toggleSelectedUser?.lastName}`}
                </Text>
              </View>

              <Text className="capitalize text-bgDefault font-semibold text-sm">
                {toggleSelectedUser?.accountType}
              </Text>
            </View>
            <TouchableOpacity className="absolute right-2 top-2 p-1">
              <AntDesign name="close" color={'white'} size={25} />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between gap-2 items-center mb-14">
            {(currentUser?.accountType === 'passenger' &&
              toggleSelectedUser?.accountType === 'driver') ||
            (currentUser?.id === toggleSelectedUser?.id &&
              toggleSelectedUser?.accountType === 'driver') ? (
              <>
                <Pressable
                  onPress={handleCall}
                  className="flex-1 justify-center items-center py-1 border border-primary-900 rounded-md flex-row gap-1"
                >
                  <Feather name="phone" size={12} color={lightPrimaryColor} />
                  <Text className="text-sm text-gray-700 mt-1">Call</Text>
                </Pressable>
                <Pressable
                  onPress={handleChat}
                  className="flex-1 justify-center items-center py-1 border border-primary-900 rounded-md flex-row gap-1"
                >
                  <Feather
                    name="message-circle"
                    size={12}
                    color={lightPrimaryColor}
                  />
                  <Text className="text-sm text-gray-700 mt-1">Chat</Text>
                </Pressable>
                {currentUser?.accountType === 'driver' && (
                  <>
                    <Pressable
                      onPress={handleCancelTrip}
                      className="flex-1 justify-center items-center py-1  rounded-md flex-row gap-1 border border-primary-900"
                    >
                      <Feather name="eye" size={12} color={lightPrimaryColor} />
                      <Text className="text-sm text-gray-700 mt-1">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleCompleteTrip}
                      className="flex-1 justify-center items-center py-1 bg-primary-900 rounded-md flex-row gap-1"
                    >
                      <Feather name="check" size={12} color="#fff" />
                      <Text className="text-sm text-white mt-1">End</Text>
                    </Pressable>
                  </>
                )}
              </>
            ) : (
              <Button
                title="View Profile"
                onPress={() => {
                  setUserProfileData(toggleSelectedUser);
                  router.navigate('/(root)/profile');
                }}
                classStyle="flex-1"
              />
            )}
          </View>
        </KeyBoardViewArea>
      </CustomBottomSheet>
    </>
  );
}
