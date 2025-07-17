import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Pressable,
  Keyboard,
  AppState,
  AppStateStatus,
  Dimensions,
  StyleSheet,
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
import { Button } from './ui/Button';
import {
  formatCurrency,
  formatDateHuman,
  Wordstruncate,
} from '@/utils';
import { BASEURL, NAIRA } from '@/utils/fetch';
import { RideHistoryBasicProps } from '@/types/vehicle';
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
import { LocationProps, User } from '@/types';
import { useLanguageStore } from '@/store/useLanguageStore';

// Import react-native-maps with OpenStreetMap
import MapView, { 
  Marker, 
  Polyline, 
  PROVIDER_DEFAULT,
  Region,
  LatLng,
  MapPressEvent,
  MarkerPressEvent,
  UrlTile
} from 'react-native-maps';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Types and Interfaces
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

interface TripState {
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  progress: number;
  estimatedTimeRemaining?: number;
}

interface MapRegion extends Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Constants
const TRIP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'inprogress',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
const LOCATION_DISTANCE_INTERVAL = 20; // 20 meters
const TRIP_PROGRESS_UPDATE_INTERVAL = 5000; // 5 seconds
const MAP_ANIMATION_DURATION = 1000;

const tripOnMove = [TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.ACTIVE];
const tripEnded = [TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED];

const locationInit: LocationProps = {
  address: '',
  lat: 0,
  lng: 0,
};

// OpenStreetMap tile URL template
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// Custom map style for better visibility
const customMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f5f5' }]
  }
];

export default function TripMonitoringOSM() {
  const { colors } = useThemeStore();
  const currentUser = useAuthStore((s) => s.user);
  const setChatUser = useChatStore((s) => s.setChatUser);
  const isSetGlobalLoading = useLanguageStore((s) => s.setIsAppLoading);
  const setUserProfileData = useProfileStore((s) => s.setUserProfileData);
  const trip = useRideStore((s) => s.rideActiveDetail);
  const setRideActiveDetail = useRideStore((s) => s.setRideActiveDetail);

  // Early returns for invalid states
  if (!trip) return <Redirect href={'/(root)/(tabs)'} />;
  if (Platform.OS === 'web') return <Redirect href={'/(root)/(tabs)'} />;

  const user = trip.user;
  if (!user) {
    return <BgLoading popup={true} title="Initializing monitoring..." />;
  }

  // State management
  const [passengers, setPassengers] = useState<RideHistoryBasicProps[]>(
    trip?.rideHistory || [],
  );
  const [currentLocation, setCurrentLocation] = useState<LocationProps>(locationInit);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [tripProgress, setTripProgress] = useState(0);
  const [tripState, setTripState] = useState<TripState>({
    isActive: tripOnMove.includes(trip.dstatus as any),
    isCompleted: trip.dstatus === TRIP_STATUS.COMPLETED,
    isCancelled: trip.dstatus === TRIP_STATUS.CANCELLED,
    progress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleDetail, setToggleDetail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: trip.pickup_location?.lat || 0,
    longitude: trip.pickup_location?.lng || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Refs
  const mapRef = useRef<MapView | null>(null);
  const locationSubscription = useRef<ExpLocation.LocationSubscription | null>(null);
  const tripServiceRef = useRef<TripWs | null>(null);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Selected states
  const [selectedPassenger, setSelectedPassenger] = useState<RideHistoryBasicProps | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);

  // Memoized calculations
  const isDriver = useMemo(() => currentUser?.accountType === 'driver', [currentUser?.accountType]);
  const isPassenger = useMemo(() => currentUser?.accountType === 'passenger', [currentUser?.accountType]);
  const canControlTrip = useMemo(() => isDriver && currentUser?.id === user.id, [isDriver, currentUser?.id, user.id]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Request location permissions
  const requestLocationPermissions = useCallback(async () => {
    try {
      const { status: foregroundStatus } = await ExpLocation.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setError('Location permission is required for trip monitoring');
        return false;
      }

      // Request background permissions for drivers
      if (isDriver) {
        const { status: backgroundStatus } = await ExpLocation.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert(
            'Background Location',
            'Background location access helps provide better trip tracking',
            [{ text: 'OK' }]
          );
        }
      }

      setIsLocationPermissionGranted(true);
      return true;
    } catch (err) {
      console.error('Failed to request location permissions:', err);
      setError('Failed to request location permissions');
      return false;
    }
  }, [isDriver]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback((lat: number, lng: number) => {
    // if (tripServiceRef.current) {
    //   tripServiceRef.current.disconnect();
    // }

    // tripServiceRef.current = new TripWs({ lat, lng });
    
    // // Set up event listeners
    // tripServiceRef.current.on('tripStarted', (data) => {
    //   console.log('Trip started:', data);
    //   setTripState(prev => ({ ...prev, isActive: true }));
    //   setRideActiveDetail(data);
    // });

    // tripServiceRef.current.on('locationUpdate', (data) => {
    //   console.log('Location update:', data);
    //   setRideActiveDetail(data);
    //   updatePassengersList(data.user?.rideHistory || []);
    // });

    // tripServiceRef.current.on('tripEnded', (data) => {
    //   console.log('Trip ended:', data);
    //   const activePassengers = data.user.rideHistory.filter(
    //     (item: RideHistoryBasicProps) => !tripEnded.includes(item?.dstatus as any)
    //   );
    //   setPassengers(activePassengers);
    //   setTripState(prev => ({ ...prev, isCompleted: true, isActive: false }));
    //   setRideActiveDetail(data);
    // });

    // tripServiceRef.current.on('tripCancelled', (data) => {
    //   console.log('Trip cancelled:', data);
    //   setTripState(prev => ({ ...prev, isCancelled: true, isActive: false }));
    //   setRideActiveDetail(data);
    // });

    // tripServiceRef.current.on('tripAllCancelled', (data) => {
    //   console.log('All trips cancelled:', data);
    //   setTripState(prev => ({ ...prev, isCancelled: true, isActive: false }));
    //   setRideActiveDetail(data);
    // });

    // tripServiceRef.current.on('error', (error) => {
    //   console.error('WebSocket error:', error);
    //   setConnectionStatus('disconnected');
    //   setError('Connection error. Retrying...');
    // });

    // tripServiceRef.current.on('connect', () => {
    //   setConnectionStatus('connected');
    //   setError(null);
    // });

    // tripServiceRef.current.on('disconnect', () => {
    //   setConnectionStatus('disconnected');
    // });

    // Connect to WebSocket
    // setConnectionStatus('connecting');
    // tripServiceRef.current.connect(user?.id || '', trip.id);

    return tripServiceRef.current;
  }, [user?.id, trip.id, setRideActiveDetail]);

  // Update passengers list
  const updatePassengersList = useCallback((newPassengers: RideHistoryBasicProps[]) => {
    const activePassengers = newPassengers.filter(
      (passenger) => !tripEnded.includes(passenger?.dstatus as any)
    );
    setPassengers(activePassengers);
  }, []);

  // Start location tracking
  const startLocationTracking = useCallback(async () => {
    try {
      if (!isLocationPermissionGranted) {
        const granted = await requestLocationPermissions();
        if (!granted) return;
      }

      // Stop existing subscription
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      locationSubscription.current = await ExpLocation.watchPositionAsync(
        {
          accuracy: ExpLocation.Accuracy.BestForNavigation,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: LOCATION_DISTANCE_INTERVAL,
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: Date.now(),
            speed: location.coords.speed || 0,
            heading: location.coords.heading || 0,
            accuracy: location.coords.accuracy || 0,
          };

          try {
            const [address] = await ExpLocation.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });

            setCurrentLocation({
              lat: locationData.latitude,
              lng: locationData.longitude,
              address: address.formattedAddress || 'Unknown location',
            });

            setCurrentSpeed((location.coords.speed || 0) * 3.6); // Convert m/s to km/h

            // Update map region to follow current location
            const newRegion: MapRegion = {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            setMapRegion(newRegion);

            // Initialize WebSocket if not already done
            if (!tripServiceRef.current) {
              initializeWebSocket(locationData.latitude, locationData.longitude);
            }

            // Send location update
            if (tripServiceRef.current && connectionStatus === 'connected') {
              tripServiceRef.current.sendStartTrip();
            }

            // Update trip progress
            updateTripProgress(locationData);
          } catch (err) {
            console.error('Failed to reverse geocode:', err);
          }
        },
      );
    } catch (err) {
      console.error('Failed to start location tracking:', err);
      setError('Failed to start location tracking');
    }
  }, [isLocationPermissionGranted, requestLocationPermissions, initializeWebSocket, connectionStatus]);

  // Calculate route using simple interpolation (can be enhanced with routing service)
  const calculateRoute = useCallback(async () => {
    try {
      const pickupLat = trip.pickup_location?.lat || currentLocation.lat;
      const pickupLng = trip.pickup_location?.lng || currentLocation.lng;
      const destLat = trip.destination_address?.lat || 0;
      const destLng = trip.destination_address?.lng || 0;

      if (!pickupLat || !pickupLng || !destLat || !destLng) {
        console.warn('Invalid coordinates for route calculation');
        return;
      }

      // Simple route calculation - in production, use a routing service like OSRM
      const route: LatLng[] = [
        { latitude: pickupLat, longitude: pickupLng },
        { latitude: destLat, longitude: destLng },
      ];

      // Add intermediate points for better route visualization
      const steps = 10;
      const interpolatedRoute: LatLng[] = [];
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lat = pickupLat + (destLat - pickupLat) * ratio;
        const lng = pickupLng + (destLng - pickupLng) * ratio;
        interpolatedRoute.push({ latitude: lat, longitude: lng });
      }

      setRouteCoordinates(interpolatedRoute);

      // Calculate estimated arrival time
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + Number(trip.ride_time || 30));
      setEstimatedArrival(estimatedTime);

      // Fit map to show route
      if (mapRef.current && interpolatedRoute.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(interpolatedRoute, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to calculate route:', err);
    }
  }, [trip, currentLocation]);

  // Update trip progress
  const updateTripProgress = useCallback((currentLocationData: LocationData) => {
    if (!trip.pickup_location || !trip.destination_address) return;

    const startLat = trip.pickup_location.lat;
    const startLng = trip.pickup_location.lng;
    const endLat = trip.destination_address.lat;
    const endLng = trip.destination_address.lng;
    const currentLat = currentLocationData.latitude;
    const currentLng = currentLocationData.longitude;

    const totalDistance = calculateDistance(startLat, startLng, endLat, endLng);
    const remainingDistance = calculateDistance(currentLat, currentLng, endLat, endLng);
    
    const progress = Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100));
    
    setTripProgress(progress);
    setTripState(prev => ({ ...prev, progress }));

    // Calculate estimated time remaining
    if (currentSpeed > 0) {
      const estimatedTimeRemaining = (remainingDistance / currentSpeed) * 60; // in minutes
      setTripState(prev => ({ ...prev, estimatedTimeRemaining }));
    }
  }, [trip, calculateDistance, currentSpeed]);

  // Handle app state changes
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground, restart location tracking if needed
      if (tripState.isActive && !locationSubscription.current) {
        startLocationTracking();
      }
    }
    appStateRef.current = nextAppState;
  }, [tripState.isActive, startLocationTracking]);

  // Initialize trip monitoring
  const initializeTripMonitoring = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request permissions first
      const permissionGranted = await requestLocationPermissions();
      if (!permissionGranted) {
        setIsLoading(false);
        return;
      }

      // Start location tracking
      await startLocationTracking();
      
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
    }
  }, [requestLocationPermissions, startLocationTracking, calculateRoute]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (tripServiceRef.current) {
      tripServiceRef.current.disconnect();
      tripServiceRef.current = null;
    }

    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
      progressUpdateInterval.current = null;
    }
  }, []);

  // Event handlers
  const handleSelectPassenger = useCallback((passenger: RideHistoryBasicProps) => {
    setSelectedPassenger(passenger);
    setSelectedDriver(null);
    setModalVisible(true);
    
    if (passenger.current_location?.lat && passenger.current_location?.lng) {
      const region: MapRegion = {
        latitude: passenger.current_location.lat,
        longitude: passenger.current_location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current?.animateToRegion(region, MAP_ANIMATION_DURATION);
    }
  }, []);

  const centerMapOnBothUsers = useCallback((
    d_lat: number,
    d_lng: number,
    p_lat: number,
    p_lng: number,
  ) => {
    if (mapRef.current && d_lat && d_lng && p_lat && p_lng) {
      const coordinates = [
        { latitude: d_lat, longitude: d_lng },
        { latitude: p_lat, longitude: p_lng },
      ];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  }, []);

  const handleCompleteTrip = useCallback(() => {
    if (!canControlTrip || !selectedPassenger) return;

    Alert.alert(
      'Complete Trip',
      `Are you sure you want to complete the trip for ${selectedPassenger.user?.firstName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            isSetGlobalLoading(true);
            try {
              if (tripServiceRef.current) {
                await tripServiceRef.current.sendEndTrip(
                  selectedPassenger.user?.id || '',
                  selectedPassenger.id || '',
                );
              }
              setModalVisible(false);
            } catch (error) {
              console.error('Failed to complete trip:', error);
              Alert.alert('Error', 'Failed to complete trip. Please try again.');
            } finally {
              isSetGlobalLoading(false);
            }
          },
        },
      ],
    );
  }, [canControlTrip, selectedPassenger, isSetGlobalLoading]);

  const handleCancelTrip = useCallback(() => {
    if (!canControlTrip || !selectedPassenger) return;

    Alert.alert(
      'Cancel Trip',
      `Are you sure you want to cancel the trip for ${selectedPassenger.user?.firstName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            isSetGlobalLoading(true);
            try {
              if (tripServiceRef.current) {
                await tripServiceRef.current.sendCancelTrip(
                  selectedPassenger.user?.id || '');
              }
              setModalVisible(false);
            } catch (error) {
              console.error('Failed to cancel trip:', error);
              Alert.alert('Error', 'Failed to cancel trip. Please try again.');
            } finally {
              isSetGlobalLoading(false);
            }
          },
        },
      ],
    );
  }, [canControlTrip, selectedPassenger, isSetGlobalLoading]);

  const handleChat = useCallback(() => {
    const chatUser = selectedPassenger?.user || selectedDriver || user;
    setChatUser(chatUser);
    router.navigate('/(root)/chat');
    setModalVisible(false);
  }, [selectedPassenger, selectedDriver, user, setChatUser]);

  const handleCall = useCallback(() => {
    const phoneUser = selectedPassenger?.user || selectedDriver || user;
    if (phoneUser?.phoneNumber) {
      openURL(`tel:${phoneUser.phoneNumber}`);
    }
  }, [selectedPassenger, selectedDriver, user]);

  const handleDriverProfile = useCallback(() => {
    if (currentUser?.id === user.id) {
      setUserProfileData(user);
      router.navigate('/(root)/profile');
      return;
    }

    setSelectedDriver(user);
    setSelectedPassenger(null);
    setModalVisible(true);
  }, [currentUser?.id, user, setUserProfileData]);

  // Map event handlers
  const handleMapPress = useCallback((event: MapPressEvent) => {
    // Handle map press events if needed
    console.log('Map pressed:', event.nativeEvent.coordinate);
  }, []);

  const handleMarkerPress = useCallback((event: MarkerPressEvent) => {
    // Handle marker press events
    console.log('Marker pressed:', event.nativeEvent.coordinate);
  }, []);

  // Effects
  useEffect(() => {
    initializeTripMonitoring();
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      cleanup();
      appStateSubscription?.remove();
    };
  }, []);

  // Update passengers when trip data changes
  useEffect(() => {
    if (trip?.rideHistory) {
      updatePassengersList(trip.rideHistory);
    }
  }, [trip?.rideHistory, updatePassengersList]);

  // Auto-retry connection
  useEffect(() => {
    if (connectionStatus === 'disconnected' && tripState.isActive) {
      const retryTimeout = setTimeout(() => {
        if (currentLocation.lat && currentLocation.lng) {
          initializeWebSocket(currentLocation.lat, currentLocation.lng);
        }
      }, 5000);

      return () => clearTimeout(retryTimeout);
    }
  }, [connectionStatus, tripState.isActive, currentLocation, initializeWebSocket]);

  // Error state
  if (error && !isLoading) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
        <Button title="Retry" onPress={initializeTripMonitoring} />
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return <BgLoading popup={true} title="Initializing trip monitoring..." />;
  }

  const toggleSelectedUser = selectedPassenger?.user || selectedDriver;

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Map with OpenStreetMap */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT} // Use default provider (OpenStreetMap)
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onPress={handleMapPress}
          showsUserLocation={false}
          showsMyLocationButton={true}
          showsTraffic={false} // Not available with OSM
          loadingEnabled={true}
          customMapStyle={customMapStyle}
          mapType="none"
        >
             <UrlTile
    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    maximumZ={19}
    flipY={false}
  />
            {/* <MapView
  ref={mapRef}
  style={styles.map}
  provider={PROVIDER_DEFAULT}
  region={mapRegion}
  onRegionChangeComplete={setMapRegion}
  mapType="none" // disables default map tiles
  showsUserLocation={false}
  showsMyLocationButton={true}
  showsTraffic={false}
  loadingEnabled={true}
> */}
          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[5, 5]}
              lineJoin="round"
              lineCap="round"
            />
          )}

          {/* Passenger Markers */}
          {passengers.map((passenger) => (
            <Marker
              key={passenger.id}
              coordinate={{
                latitude: passenger.current_location?.lat || 0,
                longitude: passenger.current_location?.lng || 0,
              }}
              title="Passenger"
              description={`${passenger.user?.firstName} ${passenger.user?.lastName}`}
              onPress={() => handleSelectPassenger(passenger)}
            >
              <BlinkingBeacon
                imageSrc={{ uri: `${BASEURL}${passenger.user?.photoURL}` }}
                name={passenger.user?.firstName || 'Passenger'}
              />
            </Marker>
          ))}

          {/* Driver/Current Location Marker */}
          <Marker
            coordinate={{
              latitude: tripOnMove.includes(trip.dstatus as any)
                ? currentLocation.lat || trip.current_lat || trip.pickup_location?.lat || 0
                : trip.pickup_location?.lat || 0,
              longitude: tripOnMove.includes(trip.dstatus as any)
                ? currentLocation.lng || trip.current_lng || trip.pickup_location?.lng || 0
                : trip.pickup_location?.lng || 0,
            }}
            title={isDriver ? "Your Location" : "Driver Location"}
            description={
              tripOnMove.includes(trip.dstatus as any)
                ? currentLocation.address || 'Current location'
                : trip.pickup_location?.address || 'Pickup location'
            }
            pinColor="green"
          >
            <BlinkingBeacon
              imageSrc={{ uri: `${BASEURL}${trip.user?.photoURL}` }}
              name={trip.user?.firstName || 'Driver'}
            />
          </Marker>

          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: trip.destination_address?.lat || 0,
              longitude: trip.destination_address?.lng || 0,
            }}
            title="Destination"
            description={trip.dest_address}
            pinColor="red"
          />
        </MapView>

        {/* Connection Status Indicator */}
        {/* {connectionStatus !== 'connected' && (
          <View style={styles.connectionStatus}>
            <View style={styles.connectionStatusContent}>
              <Ionicons 
                name={connectionStatus === 'connecting' ? 'sync' : 'warning'} 
                size={16} 
                color="#f59e0b" 
              />
              <Text style={styles.connectionStatusText}>
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection lost. Retrying...'}
              </Text>
            </View>
          </View>
        )} */}

        {/* Header Controls */}
        <View style={styles.headerControls}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={26} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <StatusBadge status={trip.dstatus} />
              <TouchableOpacity
                onPress={() => {
                  setToggleDetail(!toggleDetail);
                  centerMapOnBothUsers(
                    currentLocation.lat || trip.current_lat || 0,
                    currentLocation.lng || trip.current_lng || 0,
                    trip.destination_address?.lat || 0,
                    trip.destination_address?.lng || 0,
                  );
                }}
                style={styles.locationButton}
              >
                <MaterialIcons
                  name="my-location"
                  size={24}
                  color={toggleDetail ? colors.primary : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Trip Details Card */}
          {toggleDetail && (
            <View style={styles.tripDetailsCard}>
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location-outline" size={16} color="#9ca3af" />
                  <View style={[styles.locationLine, { backgroundColor: colors.border }]} />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <Text style={styles.locationText}>
                    {currentLocation.address || trip.origin_address?.address || 'Loading...'}
                  </Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#fca5a5" />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Destination</Text>
                  <Text style={[styles.locationText, { color: colors.text }]}>
                    {trip.dest_address}
                  </Text>
                </View>
              </View>

              <View style={styles.tripStatsRow}>
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatLabel}>Estimated Time</Text>
                  <Text style={styles.tripStatValue}>
                    {trip.ride_time ? `${trip.ride_time} mins` : 'Calculating...'}
                  </Text>
                </View>
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatLabel}>Distance</Text>
                  <Text style={styles.tripStatValue}>
                    {(trip.distance ?? 0).toFixed(2)} km
                  </Text>
                </View>
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatLabel}>Fare</Text>
                  <Text style={styles.tripStatValue}>
                    {NAIRA}{formatCurrency(trip.shared_fare_price ?? 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.tripMetricsRow}>
                <View style={styles.tripMetric}>
                  <Ionicons name="speedometer" size={16} color={colors.primary} />
                  <Text style={styles.tripMetricLabel}>Speed</Text>
                  <Text style={styles.tripMetricValue}>
                    {currentSpeed.toFixed(0)} km/h
                  </Text>
                </View>
                <View style={styles.tripMetric}>
                  <Ionicons name="analytics" size={16} color={colors.primary} />
                  <Text style={styles.tripMetricLabel}>Progress</Text>
                  <Text style={styles.tripMetricValue}>
                    {tripProgress.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.tripMetric}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                  <Text style={styles.tripMetricLabel}>Passengers</Text>
                  <Text style={styles.tripMetricValue}>
                    {passengers.length}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Passenger List */}
        <View style={styles.passengerList}>
          {passengers.map((passenger) => (
            <View style={styles.passengerItem} key={passenger.id}>
              <TouchableOpacity
                onPress={() => handleSelectPassenger(passenger)}
                style={styles.passengerButton}
              >
                <Avatar
                  source={`${passenger.user?.photoURL}`}
                  name={`${passenger.user?.firstName} ${passenger.user?.lastName}`}
                  size={48}
                  style={styles.passengerAvatar}
                />
              </TouchableOpacity>
              <View style={styles.passengerName}>
                <Text style={styles.passengerNameText}>
                  {passenger.user?.firstName}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverCardContent}>
            <TouchableOpacity
              style={styles.driverInfo}
              onPress={handleDriverProfile}
            >
              <AvatarWithStatus
                photoURL={`${user.photoURL}`}
                fullname={`${user.firstName} ${user.lastName}`}
                size={64}
                status={user.kycScore?.status || 'unverified'}
                statusStyle={{ right: -2, bottom: -2 }}
              />

              <View style={styles.driverDetails}>
                <View style={styles.driverNameRow}>
                  <Text style={styles.driverName} numberOfLines={1}>
                    {Wordstruncate(`${user.firstName} ${user.lastName}`, 20)}
                  </Text>
                  <Ionicons name="car-outline" size={16} color={bgPrimarColor} />
                </View>
                
                <Text style={styles.driverVehicle} numberOfLines={1}>
                  {user.driver?.model} • {user.driver?.interior_color} • {user.driver?.plate_number}
                </Text>
                
                <View style={styles.driverStatsRow}>
                  <View style={styles.driverStats}>
                    <Text style={styles.driverAccountType}>
                      {user.accountType}
                    </Text>
                    <View style={styles.driverRating}>
                      {user.driverStatistic?.starDistribution?.slice(0, 5).map((item, index) => (
                        <Feather
                          key={index}
                          name="star"
                          size={12}
                          color={index < (user.driverStatistic?.avgRating || 0) ? '#FFD700' : '#E0E0E0'}
                          style={{ marginLeft: 1 }}
                        />
                      ))}
                    </View>
                  </View>
                  <StatusBadge status={trip.dstatus} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet Modal */}
      <CustomBottomSheet
        isVisible={modalVisible}
        onClose={() => {
          Keyboard.dismiss();
          setModalVisible(false);
          setSelectedPassenger(null);
          setSelectedDriver(null);
        }}
        mainClass="h-[40%] w-full"
      >
        <KeyBoardViewArea
          useScroll={true}
          scrollViewProps={{
            showsHorizontalScrollIndicator: false,
            showsVerticalScrollIndicator: false,
          }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.modalCloseButton}
          >
            <MaterialIcons name="close" size={28} color={bgPrimarColor} />
          </TouchableOpacity>

          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setUserProfileData(toggleSelectedUser);
                router.navigate('/(root)/profile');
                setModalVisible(false);
              }}
            >
              <AvatarWithStatus
                photoURL={`${toggleSelectedUser?.photoURL}`}
                fullname={`${toggleSelectedUser?.firstName} ${toggleSelectedUser?.lastName}`}
                size={80}
                status={toggleSelectedUser?.kycScore?.status || 'unverified'}
                statusStyle={{ right: -4, bottom: -4 }}
              />
            </TouchableOpacity>

            <View style={styles.modalUserInfo}>
              <Text style={[styles.modalUserName, { color: colors.text }]}>
                {`${toggleSelectedUser?.firstName} ${toggleSelectedUser?.lastName}`}
              </Text>
              <Text style={styles.modalUserType}>
                {toggleSelectedUser?.accountType}
              </Text>
              {selectedPassenger && (
                <View style={styles.modalPassengerStatus}>
                  <StatusBadge status={selectedPassenger.dstatus ?? "waiting"} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable onPress={handleCall} style={styles.modalAction}>
              <Feather name="phone" size={16} color={lightPrimaryColor} />
              <Text style={styles.modalActionText}>Call</Text>
            </Pressable>

            <Pressable onPress={handleChat} style={styles.modalAction}>
              <Feather name="message-circle" size={16} color={lightPrimaryColor} />
              <Text style={styles.modalActionText}>Chat</Text>
            </Pressable>

            {canControlTrip && selectedPassenger && (
              <>
                <Pressable onPress={handleCancelTrip} style={styles.modalActionCancel}>
                  <Feather name="x" size={16} color="#ef4444" />
                  <Text style={styles.modalActionCancelText}>Cancel</Text>
                </Pressable>

                <Pressable onPress={handleCompleteTrip} style={styles.modalActionComplete}>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.modalActionCompleteText}>Complete</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyBoardViewArea>
      </CustomBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  connectionStatus: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  connectionStatusContent: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionStatusText: {
    marginLeft: 8,
    color: '#92400e',
    fontSize: 14,
  },
  headerControls: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    gap: 12,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#1f2937',
    padding: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    padding: 8,
  },
  tripDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  locationIcon: {
    width: 24,
    alignItems: 'center',
  },
  locationLine: {
    width: 2,
    height: 20,
    marginVertical: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripStat: {
    alignItems: 'center',
  },
  tripStatLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tripStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  tripMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripMetric: {
    alignItems: 'center',
  },
  tripMetricLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tripMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  passengerList: {
    position: 'absolute',
    left: 8,
    bottom: '25%',
    gap: 8,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passengerButton: {
    alignItems: 'center',
  },
  passengerAvatar: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passengerName: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  passengerNameText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  driverCard: {
    position: 'absolute',
    bottom: 64,
    left: 16,
    right: 16,
  },
  driverCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  driverVehicle: {
    fontSize: 12,
    color: '#6b7280',
  },
  driverStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverAccountType: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: bgPrimarColor,
  },
  driverRating: {
    flexDirection: 'row',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    marginTop: 24,
  },
  modalUserInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalUserName: {
    fontSize: 20,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  modalUserType: {
    textTransform: 'capitalize',
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 4,
  },
  modalPassengerStatus: {
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 56,
    paddingHorizontal: 16,
  },
  modalAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: bgPrimarColor,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  modalActionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalActionCancel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  modalActionCancelText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  modalActionComplete: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: bgPrimarColor,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  modalActionCompleteText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});