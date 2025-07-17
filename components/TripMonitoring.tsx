import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpLocation from 'expo-location';
import {
  Ionicons,
  MaterialIcons,
  Feather,
  AntDesign,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  formatCurrency,
  formatDateHuman,
  formatTime,
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

interface TripState {
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  progress: number;
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

const tripOnMove = [TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.ACTIVE];
const tripEnded = [TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED];

const locationInit: LocationProps = {
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
  const [currentLocation, setCurrentLocation] =
    useState<LocationProps>(locationInit);
  const [routeCoordinates, setRouteCoordinates] = useState<LocationData[]>([]);
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
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] =
    useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');

  // Refs
  const mapRef = useRef<MapViewType | null>(null);
  const locationSubscription = useRef<ExpLocation.LocationSubscription | null>(
    null,
  );
  const tripServiceRef = useRef<TripWs | null>(null);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Selected states
  const [selectedPassenger, setSelectedPassenger] =
    useState<RideHistoryBasicProps | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);

  // Memoized calculations
  const isDriver = currentUser?.accountType === 'driver';
  const isPassenger = currentUser?.accountType === 'passenger';
  const canControlTrip = isDriver && currentUser?.id === user.id;

  // Request location permissions
  const requestLocationPermissions = useCallback(async () => {
    try {
      const { status: foregroundStatus } =
        await ExpLocation.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setError('Location permission is required for trip monitoring');
        return false;
      }

      // Request background permissions for drivers
      if (isDriver) {
        const { status: backgroundStatus } =
          await ExpLocation.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert(
            'Background Location',
            'Background location access helps provide better trip tracking',
            [{ text: 'OK' }],
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
  // const initializeWebSocket = useCallback(
  //   (lat: number, lng: number) => {
  //     if (tripServiceRef.current) {
  //       tripServiceRef.current.disconnect();
  //     }

  //     tripServiceRef.current = new TripWs({ lat, lng });

  //     // Set up event listeners
  //     tripServiceRef.current.on('tripStarted', (data) => {
  //       console.log('Trip started:');
  //       setTripState((prev) => ({ ...prev, isActive: true }));
  //       setRideActiveDetail(data);
  //     });

  //     tripServiceRef.current.on('locationUpdate', (data) => {
  //       console.log('Location update:');
  //       setRideActiveDetail(data);
  //       updatePassengersList(data.user?.rideHistory || []);
  //     });

  //     tripServiceRef.current.on('tripEnded', (data) => {
  //       console.log('Trip ended:');
  //       const activePassengers = data.user.rideHistory.filter(
  //         (item: RideHistoryBasicProps) =>
  //           !tripEnded.includes(item?.dstatus as any),
  //       );
  //       setPassengers(activePassengers);
  //       setTripState((prev) => ({
  //         ...prev,
  //         isCompleted: true,
  //         isActive: false,
  //       }));
  //       setRideActiveDetail(data);
  //     });

  //     tripServiceRef.current.on('tripCancelled', (data) => {
  //       console.log('Trip cancelled:');
  //       setTripState((prev) => ({
  //         ...prev,
  //         isCancelled: true,
  //         isActive: false,
  //       }));
  //       setRideActiveDetail(data);
  //     });

  //     // tripServiceRef.current.on('tripAllCancelled', (data) => {
  //     //   console.log('All trips cancelled:', data);
  //     //   setTripState(prev => ({ ...prev, isCancelled: true, isActive: false }));
  //     //   setRideActiveDetail(data);
  //     // });

  //     // tripServiceRef.current.on('error', (error) => {
  //     //   console.error('WebSocket error:', error);
  //     //   setConnectionStatus('disconnected');
  //     //   setError('Connection error. Retrying...');
  //     // });

  //     // tripServiceRef.current.on('connect', () => {
  //     //   setConnectionStatus('connected');
  //     //   setError(null);
  //     // });

  //     // tripServiceRef.current.on('disconnect', () => {
  //     //   setConnectionStatus('disconnected');
  //     // });

  //     // Connect to WebSocket
  //     setConnectionStatus('connecting');
  //     tripServiceRef.current.connect(user?.id || '', trip.id);

  //     return tripServiceRef.current;
  //   },
  //   [user?.id, trip.id, setRideActiveDetail],
  // );

   // Improved WebSocket connection management
  const connectWebSocket = useCallback(
    (lat: number, lng: number) => {
      // Clean up existing connection if any
      if (tripServiceRef.current) {
        tripServiceRef.current.disconnect();
        tripServiceRef.current = null;
      }

      // Initialize new connection
      tripServiceRef.current = new TripWs({ lat, lng });
      setConnectionStatus('connecting');

      // Setup event listeners
      const setupListeners = () => {
        if (!tripServiceRef.current) return;

        tripServiceRef.current.on('tripStarted', (data) => {
          console.log('Trip started:', data);
          setTripState((prev) => ({ ...prev, isActive: true }));
          setRideActiveDetail(data);
        });

        tripServiceRef.current.on('locationUpdate', (data) => {
          console.log('Location update:', data);
          setRideActiveDetail(data);
          updatePassengersList(data.user?.rideHistory || []);
        });

        tripServiceRef.current.on('tripEnded', (data) => {
          console.log('Trip ended:', data);
          const activePassengers = data.user.rideHistory.filter(
            (item: RideHistoryBasicProps) =>
              !tripEnded.includes(item?.dstatus as any),
          );
          setPassengers(activePassengers);
          setTripState((prev) => ({
            ...prev,
            isCompleted: true,
            isActive: false,
          }));
          setRideActiveDetail(data);
        });

        tripServiceRef.current.on('tripCancelled', (data) => {
          console.log('Trip cancelled:', data);
          setTripState((prev) => ({
            ...prev,
            isCancelled: true,
            isActive: false,
          }));
          setRideActiveDetail(data);
        });
   
      };

      setupListeners();

      // Connect to WebSocket
      tripServiceRef.current.connect(user?.id || '', trip.id);

      return tripServiceRef.current;
    },
    [user?.id, trip.id, setRideActiveDetail, tripState.isActive]
  );


  // Scheduled reconnection logic
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scheduleReconnect = useCallback(() => {
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Only attempt reconnect if trip is active
    if (!tripState.isActive) return;

    if(reconnectTimeoutRef.current ) {
    // Schedule new reconnection attempt
    reconnectTimeoutRef.current = setTimeout(() => {
      if (currentLocation.lat && currentLocation.lng) {
        console.log('Attempting WebSocket reconnection...');
        connectWebSocket(currentLocation.lat, currentLocation.lng);
      }
    }, 5000); // Retry after 5 seconds
  }
  }, [tripState.isActive, currentLocation, connectWebSocket]);

 // Improved location tracking with WebSocket integration
  const startLocationTracking = useCallback(async () => {
    try {
      if (!isLocationPermissionGranted) {
        const granted = await requestLocationPermissions();
        if (!granted) return;
      }

      // Stop existing subscription
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
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

            // Initialize WebSocket if not already connected
            if (!tripServiceRef.current || connectionStatus !== 'connected') {
              connectWebSocket(
                locationData.latitude,
                locationData.longitude,
              );
            }

            // Send location update if connected
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
  }, [
    isLocationPermissionGranted,
    requestLocationPermissions,
    connectWebSocket,
    connectionStatus,
    updateTripProgress,
  ]);

  // Cleanup function - improved to clear all timeouts and subscriptions
  const cleanup = useCallback(() => {
    // Clear location subscription
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    // Clear WebSocket connection
    if (tripServiceRef.current) {
      tripServiceRef.current.disconnect();
      tripServiceRef.current = null;
    }

    // Clear progress interval
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
      progressUpdateInterval.current = null;
    }

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, []);

  // Update passengers list
  const updatePassengersList = useCallback(
    (newPassengers: RideHistoryBasicProps[]) => {
      const activePassengers = newPassengers.filter(
        (passenger) => !tripEnded.includes(passenger?.dstatus as any),
      );
      setPassengers(activePassengers);
    },
    [],
  );

  // Start location tracking
  // const startLocationTracking = useCallback(async () => {
  //   try {
  //     if (!isLocationPermissionGranted) {
  //       const granted = await requestLocationPermissions();
  //       if (!granted) return;
  //     }

  //     // Stop existing subscription
  //     if (locationSubscription.current) {
  //       locationSubscription.current.remove();
  //     }

  //     locationSubscription.current = await ExpLocation.watchPositionAsync(
  //       {
  //         accuracy: ExpLocation.Accuracy.BestForNavigation,
  //         timeInterval: LOCATION_UPDATE_INTERVAL,
  //         distanceInterval: LOCATION_DISTANCE_INTERVAL,
  //       },
  //       async (location) => {
  //         const locationData: LocationData = {
  //           latitude: location.coords.latitude,
  //           longitude: location.coords.longitude,
  //           timestamp: Date.now(),
  //           speed: location.coords.speed || 0,
  //           heading: location.coords.heading || 0,
  //         };

  //         try {
  //           const [address] = await ExpLocation.reverseGeocodeAsync({
  //             latitude: location.coords.latitude,
  //             longitude: location.coords.longitude,
  //           });

  //           setCurrentLocation({
  //             lat: locationData.latitude,
  //             lng: locationData.longitude,
  //             address: address.formattedAddress || 'Unknown location',
  //           });

  //           setCurrentSpeed((location.coords.speed || 0) * 3.6); // Convert m/s to km/h

  //           // Initialize WebSocket if not already done
  //           if (!tripServiceRef.current) {
  //             initializeWebSocket(
  //               locationData.latitude,
  //               locationData.longitude,
  //             );
  //           }

  //           // Send location update
  //           if (tripServiceRef.current && connectionStatus === 'connected') {
  //             tripServiceRef.current.sendStartTrip();
  //           }

  //           // Update trip progress
  //           updateTripProgress(locationData);
  //         } catch (err) {
  //           console.error('Failed to reverse geocode:', err);
  //         }
  //       },
  //     );
  //   } catch (err) {
  //     console.error('Failed to start location tracking:', err);
  //     setError('Failed to start location tracking');
  //   }
  // }, [
  //   isLocationPermissionGranted,
  //   requestLocationPermissions,
  //   initializeWebSocket,
  //   connectionStatus,
  // ]);

  // Calculate route
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

      // Create route coordinates
      const mockRoute: LocationData[] = [
        {
          latitude: pickupLat,
          longitude: pickupLng,
          timestamp: Date.now(),
        },
        {
          latitude: destLat,
          longitude: destLng,
          timestamp: Date.now(),
        },
      ];

      setRouteCoordinates(mockRoute);

      // Calculate estimated arrival time
      const estimatedTime = new Date();
      estimatedTime.setMinutes(
        estimatedTime.getMinutes() + Number(trip.ride_time || 30),
      );
      setEstimatedArrival(estimatedTime);

      // Fit map to show route
      if (mapRef.current && mockRoute.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(mockRoute, {
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
  const updateTripProgress = useCallback(
    (currentLocationData: LocationData) => {
      if (!trip.pickup_location || !trip.destination_address) return;

      const startLat = trip.pickup_location.lat;
      const startLng = trip.pickup_location.lng;
      const endLat = trip.destination_address.lat;
      const endLng = trip.destination_address.lng;
      const currentLat = currentLocationData.latitude;
      const currentLng = currentLocationData.longitude;

      // Calculate distances using Haversine formula
      const totalDistance = calculateDistance(
        startLat,
        startLng,
        endLat,
        endLng,
      );
      const remainingDistance = calculateDistance(
        currentLat,
        currentLng,
        endLat,
        endLng,
      );

      const progress = Math.max(
        0,
        Math.min(
          100,
          ((totalDistance - remainingDistance) / totalDistance) * 100,
        ),
      );

      setTripProgress(progress);
      setTripState((prev) => ({ ...prev, progress }));
    },
    [trip],
  );

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Handle app state changes
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, restart location tracking if needed
        if (tripState.isActive && !locationSubscription.current) {
          startLocationTracking();
        }
      }
      appStateRef.current = nextAppState;
    },
    [tripState.isActive, startLocationTracking],
  );

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
// Effects - keep your existing useEffect hooks but replace initializeWebSocket with connectWebSocket
  useEffect(() => {
    initializeTripMonitoring();

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      cleanup();
      appStateSubscription?.remove();
    };
  }, []);
  // Cleanup function
  // const cleanup = useCallback(() => {
  //   if (locationSubscription.current) {
  //     locationSubscription.current.remove();
  //     locationSubscription.current = null;
  //   }

  //   if (tripServiceRef.current) {
  //     tripServiceRef.current.disconnect();
  //     tripServiceRef.current = null;
  //   }

  //   if (progressUpdateInterval.current) {
  //     clearInterval(progressUpdateInterval.current);
  //     progressUpdateInterval.current = null;
  //   }
  // }, []);

  // Event handlers
  const handleSelectPassenger = useCallback(
    (passenger: RideHistoryBasicProps) => {
      setSelectedPassenger(passenger);
      setSelectedDriver(null);
      setModalVisible(true);

      if (passenger.current_location?.lat && passenger.current_location?.lng) {
        mapRef.current?.animateToRegion(
          {
            latitude: passenger.current_location.lat,
            longitude: passenger.current_location.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000,
        );
      }
    },
    [],
  );

  const centerMapOnBothUsers = useCallback(
    (d_lat: number, d_lng: number, p_lat: number, p_lng: number) => {
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
    },
    [],
  );

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
              Alert.alert(
                'Error',
                'Failed to complete trip. Please try again.',
              );
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
                tripServiceRef.current.sendCancelTrip(selectedPassenger.id);
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

  // Effects
  useEffect(() => {
    initializeTripMonitoring();

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

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
  // useEffect(() => {
  //   if (connectionStatus === 'disconnected' && tripState.isActive) {
  //     const retryTimeout = setTimeout(() => {
  //       if (currentLocation.lat && currentLocation.lng) {
  //         initializeWebSocket(currentLocation.lat, currentLocation.lng);
  //       }
  //     }, 5000);

  //     return () => clearTimeout(retryTimeout);
  //   }
  // }, [
  //   connectionStatus,
  //   tripState.isActive,
  //   currentLocation,
  //   initializeWebSocket,
  // ]);

  // Error state
  if (error && !isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-4">
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text
          className="text-base text-center mt-4 mb-6"
          style={{ color: colors.error }}
        >
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
      <SafeAreaView className="flex-1 bg-white relative">
        {/* Map */}
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0 h-full"
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: tripOnMove.includes(trip.dstatus as any)
              ? trip.current_lat || trip.pickup_location?.lat || 0
              : trip.pickup_location?.lat || 0,
            longitude: tripOnMove.includes(trip.dstatus as any)
              ? trip.current_lng || trip.pickup_location?.lng || 0
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
                ? currentLocation.lat ||
                  trip.current_lat ||
                  trip.pickup_location?.lat ||
                  0
                : trip.pickup_location?.lat || 0,
              longitude: tripOnMove.includes(trip.dstatus as any)
                ? currentLocation.lng ||
                  trip.current_lng ||
                  trip.pickup_location?.lng ||
                  0
                : trip.pickup_location?.lng || 0,
            }}
            title={isDriver ? 'Your Location' : 'Driver Location'}
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

        {/* Header Controls */}
        <View className="absolute flex-1 top-10 z-10 w-full gap-3 mt-4">
          <View className="flex-row justify-between items-center mx-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-default-900 p-2 rounded-full shadow-md w-12 h-12 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={26} color="#ffffff" />
            </TouchableOpacity>
            <View className="flex-row gap-2 flex-1 justify-between">
              {connectionStatus !== 'connected' && (
                <View className="ml-4 flex-1">
                  <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-2 flex-row items-center">
                    <Ionicons
                      name={
                        connectionStatus === 'connecting' ? 'sync' : 'warning'
                      }
                      size={16}
                      color="#f59e0b"
                    />
                    <Text className="ml-2 text-yellow-800 text-sm">
                      {connectionStatus === 'connecting'
                        ? 'Connecting...'
                        : 'Connection lost. Retrying...'}
                    </Text>
                  </View>
                </View>
              )}

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

          {/* Trip Details Card */}
          {toggleDetail && (
            <View className="bg-white/90 rounded-2xl p-4 shadow-md mx-4">
              <View className="flex-row items-start gap-2 mb-3">
                <View className="w-6 items-center">
                  <Ionicons name="location-outline" size={16} color="#9ca3af" />
                  <View
                    style={{ backgroundColor: colors.border }}
                    className="w-0.5 h-5 my-0.5"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-400">
                    Current Location
                  </Text>
                  <Text className="text-sm font-semibold text-gray-800 capitalize">
                    {currentLocation.address ||
                      trip.origin_address?.address ||
                      'Loading...'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-2 mb-3">
                <Ionicons name="location" size={16} color="#fca5a5" />
                <View className="flex-1">
                  <Text className="text-xs text-gray-400">Destination</Text>
                  <Text
                    className="text-sm text-gray-700 font-medium capitalize"
                    style={{ color: colors.text }}
                  >
                    {trip.dest_address}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-xs text-gray-400">Estimated Time</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {trip.ride_time
                      ? `${trip.ride_time} mins`
                      : 'Calculating...'}
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

              <View className="flex-row justify-between">
                <View className="items-center">
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
                <View className="items-center">
                  <Ionicons name="analytics" size={16} color={colors.primary} />
                  <Text className="text-xs text-gray-400">Progress</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {tripProgress.toFixed(0)}%
                  </Text>
                </View>
                <View className="items-center">
                  <Ionicons name="people" size={16} color={colors.primary} />
                  <Text className="text-xs text-gray-400">Passengers</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {passengers.length}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Passenger List */}
        <View className="absolute left-2 gap-2 bottom-[25%]">
          {passengers.map((passenger) => (
            <View className="flex-row items-center gap-2" key={passenger.id}>
              <TouchableOpacity
                onPress={() => handleSelectPassenger(passenger)}
                className="items-center"
              >
                <Avatar
                  source={`${passenger.user?.photoURL}`}
                  name={`${passenger.user?.firstName} ${passenger.user?.lastName}`}
                  size={48}
                  style={{
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                />
              </TouchableOpacity>
              <View className="bg-white/90 px-2 py-1 rounded-lg">
                <Text className="text-xs text-gray-700 font-medium">
                  {passenger.user?.firstName}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Driver Card */}
        <View className="absolute bottom-16 left-4 right-4">
          <View className="bg-white/95 rounded-2xl p-4 shadow-lg flex-row items-center">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={handleDriverProfile}
            >
              <AvatarWithStatus
                photoURL={`${user.photoURL}`}
                fullname={`${user.firstName} ${user.lastName}`}
                size={64}
                status={user.kycScore?.status || 'unverified'}
                statusStyle={{ right: -32, bottom: -12 }}
              />

              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="text-lg font-bold mr-2 capitalize"
                    numberOfLines={1}
                  >
                    {Wordstruncate(`${user.firstName} ${user.lastName}`, 20)}
                  </Text>
                  <Ionicons
                    name="car-outline"
                    size={16}
                    color={bgPrimarColor}
                  />
                </View>

                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {user.driver?.model} • {user.driver?.interior_color} •{' '}
                  {user.driver?.plate_number}
                </Text>

                <View className="flex-row justify-between items-center mt-0">
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{ color: bgPrimarColor }}
                      className="text-xs uppercase"
                    >
                      {user.accountType}
                    </Text>
                    <View className="flex-row">
                      {user.driverStatistic?.starDistribution
                        ?.slice(0, 5)
                        .map((item, index) => (
                          <Feather
                            key={index}
                            name="star"
                            size={12}
                            color={
                              index < (user.driverStatistic?.avgRating || 0)
                                ? '#FFD700'
                                : '#E0E0E0'
                            }
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
        mainClass="h-[43%] w-full"
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
            className="absolute right-4 top-4 z-10"
          >
            <MaterialIcons name="close" size={28} color={bgPrimarColor} />
          </TouchableOpacity>

          <View className="justify-center items-center flex-1 w-full mt-6">
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
                size={86}
                status={toggleSelectedUser?.kycScore?.status || 'unverified'}
                statusStyle={{ right: -32, bottom: -4 }}
              />
            </TouchableOpacity>

            <View className="justify-center items-center mt-4">
              <Text
                style={{ color: colors.text }}
                className="text-xl capitalize font-semibold"
              >
                {`${toggleSelectedUser?.firstName} ${toggleSelectedUser?.lastName}`}
              </Text>
              <Text className="capitalize text-gray-500 font-medium text-sm mt-1">
                {toggleSelectedUser?.accountType}
              </Text>
              {selectedPassenger && (
                <View className="mt-2">
                  <StatusBadge
                    status={selectedPassenger.dstatus || 'waiting'}
                  />
                </View>
              )}
            </View>
          </View>
          {canControlTrip && selectedPassenger && (
            <View className="flex-row justify-between items-center mt-3 mb-2 flex-1 mx-4">
              <View className="flex-row items-center gap-1">
                <MaterialCommunityIcons
                  name="seat-passenger"
                  size={18}
                  color={lightPrimaryColor}
                />
                <Text className="text-sm text-gray-400 font-semibold">
                  seat ({selectedPassenger?.seat})
                </Text>
              </View>

              <Text className="text-lg font-['Inter-SemiBold'] text-primary-900">
                {NAIRA}
                {formatCurrency(selectedPassenger?.shared_fare_price ?? 0)}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between gap-3 items-center mb-20 px-4">
            {isPassenger && selectedDriver ? (
              <>
                <Pressable
                  onPress={handleCall}
                  className="flex-1 justify-center items-center py-3 border border-primary-900 rounded-lg flex-row gap-2"
                >
                  <Feather name="phone" size={16} color={lightPrimaryColor} />
                  <Text className="text-sm text-gray-700 font-medium">
                    Call
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleChat}
                  className="flex-1 justify-center items-center py-3 border border-primary-900 rounded-lg flex-row gap-2"
                >
                  <Feather
                    name="message-circle"
                    size={16}
                    color={lightPrimaryColor}
                  />
                  <Text className="text-sm text-gray-700 font-medium">
                    Chat
                  </Text>
                </Pressable>
              </>
            ) : null}

            {canControlTrip && selectedPassenger && (
              <>
                <Pressable
                  onPress={handleCancelTrip}
                  className="flex-1 justify-center items-center py-3 border border-red-500 rounded-lg flex-row gap-2"
                >
                  <Feather name="x" size={16} color="#ef4444" />
                  <Text className="text-sm text-red-500 font-medium">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleCompleteTrip}
                  className="flex-1 justify-center items-center py-3 bg-primary-900 rounded-lg flex-row gap-2"
                >
                  <Feather name="check" size={16} color="#fff" />
                  <Text className="text-sm text-white font-medium">
                    Complete
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyBoardViewArea>
      </CustomBottomSheet>
    </>
  );
}
