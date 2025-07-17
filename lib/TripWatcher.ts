import { useEffect } from 'react';
import { WebSocketConnector } from './WebSocketConnector';
import { User } from '@/types';

// Define event types specific to ride request events
interface RideRequestEvents {
  activeRideAssigned: void;
  error: Error;
}

export function useTripWatcher(
  user: User | null, 
  token: string,
  setRideReQuestCounter: (count: number | ((prev: number) => number)) => void
) {
  useEffect(() => {
    if (user?.id && user?.accountType === 'driver' && user?.isAvaliable && token) {
      const tripWatcher = new WebSocketConnector<RideRequestEvents>("/ws/active-rides");

      // Connect to WebSocket with proper params format
      tripWatcher.connect({
        driverId: user?.id,
        token
      });

      // Listen for specific events
      tripWatcher.on('activeRideAssigned', () => {
        setRideReQuestCounter((prev) => prev + 1);
      });

      // Listen for errors
      tripWatcher.on('error', (error) => {
        console.error('TripWatcher WebSocket error:', error);
      });

      // Listen for connection events
      tripWatcher.on('connected', () => {
        console.log('TripWatcher connected');
      });

      tripWatcher.on('disconnected', () => {
        console.log('TripWatcher disconnected');
      });

      return () => {
        tripWatcher.disconnect();
      };
    }
  }, [user?.id, user?.accountType, user?.isAvaliable, token, setRideReQuestCounter]);
}

