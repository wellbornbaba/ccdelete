import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationState {
  location: Location.LocationObject | null;
  address: string | null;
  errorMsg: string | null;
  isLoading: boolean;
}

export default function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    address: null,
    errorMsg: null,
    isLoading: true,
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Request permission to access location
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setState({
            location: null,
            address: null,
            errorMsg: 'Permission to access location was denied',
            isLoading: false,
          });
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Get address for the current location
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Format address
        const formattedAddress = address
          ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`
          : null;

        setState({
          location,
          address: formattedAddress,
          errorMsg: null,
          isLoading: false,
        });
      } catch (error) {
        setState({
          location: null,
          address: null,
          errorMsg: 'Could not fetch location',
          isLoading: false,
        });
      }
    };

    // Only run on non-web platforms or with a mock for web
    if (Platform.OS !== 'web') {
      getLocation();
    } else {
      // Mock location for web
      setTimeout(() => {
        setState({
          location: {
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
              altitude: null,
              accuracy: 20,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          },
          address: '123 ikej lg',
          errorMsg: null,
          isLoading: false,
        });
      }, 1000);
    }
  }, []);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // Get address for the provided coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      // Format address
      return address
        ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`
        : null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  };

  return {
    ...state,
    getAddressFromCoordinates,
  };
}