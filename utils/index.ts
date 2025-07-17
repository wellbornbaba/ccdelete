import { Address } from './../node_modules/react-native-maps/src/MapView.types';
import * as ExpoLocation from 'expo-location';
import { LocationProps, Ride, User, Userd } from '@/types';
import Toast from 'react-native-toast-message';
import { AxiosGet, GEOAPIKEY, postAPI } from './fetch';
import { LocationObject } from 'expo-location';
import { useAuthStore } from '@/store/useAuthStore';
import { useSignUpStore } from '@/store/useSignUpStore';
import { router } from 'expo-router';

export const sortRides = (rides: Ride[]): Ride[] => {
  const result = rides.sort((a, b) => {
    const dateA = new Date(`${a.created_at}T${a.ride_time}`);
    const dateB = new Date(`${b.created_at}T${b.ride_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return result.reverse();
};

export function formatTime(minutes: number): string {
  const formattedMinutes = +minutes?.toFixed(0) || 0;

  if (formattedMinutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day < 10 ? '0' + day : day} ${month} ${year}`;
}

export function uuid(length: number = 12): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function maskString(
  str: string,
  start: number,
  end: number,
  maskType = '*',
): string {
  if (start < 0 || end > str.length || start >= end) {
    return 'Invalid range';
  }

  const mask = maskType.repeat(end - start);
  return str.slice(0, start) + mask + str.slice(end);
}

export function nairaFormatted(amount: number, usecurrency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: usecurrency,
  }).format(amount);
}

export function formatCurrency(
  inputamount: number | string,
  decimal = true,
  locale = 'en-US',
) {
  if (!inputamount) return 0.0;
  // const amount = cleanNumber(inputamount.toString());
  if (decimal) {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2, // Ensures two decimal places
      maximumFractionDigits: 2,
    }).format(Number(inputamount));
  } else {
    return new Intl.NumberFormat(locale).format(Number(inputamount));
  }
}

export const InputAmountFormater = (value: string) => {
  // Remove non-numeric characters except '.' and ','
  const sanitizedValue = value.replace(/[^0-9.]/g, '');

  return {
    value: sanitizedValue,
    valueConverted: formatCurrency(sanitizedValue, false),
  };
};

export const ZodChecker = (ZodData: any) => {
  if (ZodData?.error) {
    if (ZodData.error?.issues) {
      
      const Errormsg = ZodData.error.issues[0];
      Toast.show({
        type: 'error',
        text1: Errormsg.message,
      });
      return true;
    }

    Toast.show({
      type: 'error',
      text1: ZodData.error,
    });
    return true;
  }

  return false;
};

export function capitalizeFirstLetter(text: string) {
  if (!text) return ''; // Handle empty strings
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const formatLocation = (address: string | null): string => {
  if (!address) return 'Current location';

  const parts = address.split(',').map((part) => part.trim());

  // Exclude Plus Code (usually appears as first part, e.g., "M8VR+5JV")
  const isPlusCode =
    /^[23456789CFGHJMPQRVWX]{4}\+[23456789CFGHJMPQRVWX]{2,}$/.test(parts[0]);
  let fallbackParts;
  if (isPlusCode) {
    // If there are at least city and region or more
    fallbackParts = parts.slice(1, 4).filter(Boolean);
  } else {
    fallbackParts = parts.slice(0, 4).filter(Boolean);
  }

  return fallbackParts.length > 0
    ? fallbackParts.join(', ')
    : 'Current location';
};

export const formatAddress = (address?: string) => {
  if (!address) return '';
  // Truncate long addresses
  return address.length > 30 ? address.substring(0, 30) + '...' : address;
};

export function Wordstruncate(
  text: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export const checkKYCverify = (userData: User) =>
  userData?.kycVerifications?.email &&
  userData?.kycVerifications.phone &&
  userData?.kycVerifications.government_id &&
  userData?.kycVerifications.proof_address &&
  userData?.kycVerifications.selfie_verification
    ? true
    : false;

export interface LocationLngLatProps extends LocationObject {
  lat: number;
  lng: number;
  address?: string;
}
export const getLocationAddress = async (location: LocationLngLatProps) => {
  const { lat, lng } = location;
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIKEY}`;
};

export const getLocationAddressByLatitudeLongitute = async (
  lat: number,
  lng: number,
  geoapi_key?: string,
) => {
  // Reverse geocode to get address
  const [address] = await ExpoLocation.reverseGeocodeAsync({
    latitude: lat,
    longitude: lng,
  });

  return address.formattedAddress;

  // const geourl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${geoapi_key}`;

  // try {
  //   const response = await AxiosGet(geourl);
  //   const proper = response.features[0].properties;

  //   if (proper) {
  //     const { formatted, city, county, state, address_line1, address_line2 } =
  //       proper;
  //     const geoAddress =
  //       address_line1 === city
  //         ? `${address_line1}, ${county}, ${state}`
  //         : `${address_line1}, ${city}, ${county}, ${state}`;

  //     return geoAddress;
  //   }
  // } catch (error) {
  //   console.log(`Errror: ${error}`);
  // }
  // return false;
};

export const LocationFormatted = (features: any) => {
  const proper = features.properties;

  if (proper) {
    const { formatted, city, county, state, address_line1, address_line2 } =
      proper;
    const geoAddress =
      address_line1 === city
        ? `${address_line1}, ${county}, ${state}`
        : `${address_line1}, ${city}, ${county}, ${state}`;

    return geoAddress;
  }

  return proper.formatted;
};

export const getLocationByDefault = async () => {
  const geoData: LocationProps = {
    lat: 0,
    lng: 0,
    address: '',
  };

  try {
    // Request permission
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Location permission denied',
      });
      return geoData;
    }

    // Get location
    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Reverse geocode to get address
    const [address] = await ExpoLocation.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    // const formattedAddress = address
    //   ? `${address.name || address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`
    //   : 'Unknown address';

    return {
      lat: latitude,
      lng: longitude,
      address: address.formattedAddress,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to get location',
    });
    return geoData;
  }
};

export const KYCColor = (noOfKYC: number) => {
  if (noOfKYC === 0) {
    return { bg: 'bg-red-700', tx: 'text-red-700' };
  } else if (noOfKYC >= 1 && noOfKYC <= 2) {
    return { bg: 'bg-red-400', tx: 'text-red-400' };
  } else if (noOfKYC >= 3 && noOfKYC < 5) {
    return { bg: 'bg-green-500', tx: 'text-green-500' };
  } else if (noOfKYC === 5) {
    return { bg: 'bg-green-700', tx: 'text-green-700' };
  } else {
    return { bg: 'bg-red-700', tx: 'text-red-700' }; // fallback for >5
  }
};

export function formatTimeHuman(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const h12 = hours % 12 || 12;
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  return `${h12}:${mm}${isPM ? 'pm' : 'am'}`;
}

export function formatDateHuman(usedate: Date): string {
  const now = new Date();
  const date = new Date(usedate);
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffSec > 0) {
    if (diffMin < 60) return `in ${diffMin}min`;
    if (diffHour < 24) return `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`;
  } else {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) return 'Today';
    if (target.getTime() === yesterday.getTime()) return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculates the distance in kilometers between two geo points.
 */
export function calculateDistanceKm(
  from: LocationProps,
  to: LocationProps,
): number {
  const  fromLat = Number(from.lat);
  const  fromLng = Number(from.lng);
  const  toLat = Number(to.lat);
  const  toLng = Number(to.lng);
  
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const R = 6371; // Earth radius in kilometers
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const res = R * c;
  return Number(res.toFixed(2));
}

export const UpdateLocation = async (
  userData: User | null,
  lastLocation: LocationProps | undefined,
  JWTtoken: string | null,
  MIN_DISTANCE_TO_UPDATE_METERS: number = 100 // <-- now accepts meters
): Promise<LocationProps> => {
  
  try {
    const currentLocation = (await getLocationByDefault()) as LocationProps;

    if (!currentLocation || !currentLocation.address) return lastLocation || currentLocation;

    // Convert meters to kilometers
    const minDistanceKm = MIN_DISTANCE_TO_UPDATE_METERS / 1000;

    const hasMovedFar =
      !lastLocation ||
      calculateDistanceKm(currentLocation, lastLocation) > minDistanceKm;
      
    if (hasMovedFar) {
      const dbParam = {
        userid: userData?.id,
        Address: formatLocation(currentLocation.address),
        ...currentLocation,
      };

      const endpoint = userData?.userLocations
        ? `/api/user-locations/${userData.userLocations.id}`
        : `/api/user-locations`;
      const method = userData?.userLocations ? 'PUT' : 'POST';

      try {
        const res = await postAPI(endpoint, dbParam, method, JWTtoken || undefined);
        
      } catch (err) {
        console.log('Location update error:', err);
      }

      return currentLocation;
    } else {
      console.log('Skipped location update: user hasn’t moved far enough');
      return lastLocation;
    }
  } catch (err) {
    console.log('Error getting location:', err);
    return lastLocation || { lat: 0, lng: 0, address: '' };
  }
};

/**
 * Estimate future DateTime for ride completion.
 * @param distanceKm - Distance in kilometers
 * @param averageSpeedKmph - Average speed in km/h (default is 40)
 * @returns Future Date object representing expected arrival time
 */
export function getEstimatedArrivalTime(
  distanceKm: number,
  averageSpeedKmph = 40
): string {
  if (distanceKm <= 0 || averageSpeedKmph <= 0) return '';

  const timeHours = distanceKm / averageSpeedKmph;
  const estimatedMinutes = Math.ceil(timeHours * 60);

  const now = new Date();
  now.setMinutes(now.getMinutes() + estimatedMinutes);

  const pad = (n: number) => String(n).padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());

   const newdate = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
  return newdate.toISOString()
}

export const loginAccess = async (
  phoneNumber: string, 
  password: string,
  setIsLoginAuth: (isAuth: boolean) => void,
  setJWTtoken: (token: string) => void,
  setUser: (user: User) => void,
  setUserSignUpData?: (data: Userd) => void,
) => {
    
    try {
      // Mock API call delay
      if (!phoneNumber.trim() || !password.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Phone Number and password is required',
        });
        return;
      }

      const userDataString = await postAPI('/api/auth/login', {
        phoneNumber,
        password,
      });

      if(ZodChecker(userDataString)){
        return;
      }
      console.log(userDataString);
      
      console.log(userDataString.success);
      
      if (userDataString.success) {
        const {user,token} = userDataString.data
        // check if verification is not yet set
        if (user.otpcode) {
          setUserSignUpData && setUserSignUpData({...user,phone: user.phoneNumber})
          router.push('/(auth)/verify');
          return;
        }

        setIsLoginAuth(true)
        setJWTtoken(token);
        setUser(user);
        router.replace('/(root)/(tabs)');

      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid phone number or password',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number or password',
      });
    } 
}