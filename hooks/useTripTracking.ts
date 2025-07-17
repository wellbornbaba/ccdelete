import { useEffect, useState, useCallback, useRef } from 'react';
import WebSocketService from '@/lib/WebSocketService';
import { WEBSOCKET_API } from '@/utils/fetch';
import { accountTypeProps, LocationProps } from '@/types';
import { TripMonitoringProps } from '@/types/vehicle';
import { getLocationByDefault } from '@/utils';
import { WebSocketConnector } from '@/lib/WebSocketConnector';

export type TripEvent =
  | 'locationUpdate'
  | 'tripStarted'
  | 'tripEnded'
  | 'tripCancelled'
  | 'tripAllCancalled'
  | 'error'
  | 'connected'
  | 'disconnected';

interface TripTrackingOptions {
  userid: string;
  rideid?: string;
  isDriver?: boolean;
  autoConnect?: boolean;
  onTripUpdate?: (data: any) => void;
}

interface APIResponseProps {
  type?: TripEvent;
  status: boolean;
  message: string;
  data: any;
}

interface UseTripTrackingReturn {
  resData: APIResponseProps;
  isConnected: boolean;
  errorWs: Error | null;
  sendLocationUpdate: () => void;
  connect: () => void;
  disconnect: () => void;
  sendStartTrip: () => void;
  sendEndTrip: (userid: string, historrid: string) => void;
  sendCancelTrip: (userid: string, historrid: string) => void;
  sendCancelAllTrip: () => void;
}

export const useTripTracking = ({
  userid,
  rideid,
  autoConnect = true,
}: TripTrackingOptions): UseTripTrackingReturn => {
  const [resData, setResData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorWs, setError] = useState<Error | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationProps | null>(null);
 const lastSentRef = useRef<number>(0);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  // Step 1: Fetch current location
  useEffect(() => {
    (async () => {
      try {
        const location = await getLocationByDefault() as LocationProps;
        setCurrentLocation(location);
      } catch (err) {
        console.warn("Failed to fetch location:", err);
      }
    })();
  }, []);

  // Step 2: Initialize WebSocket after location is ready
  useEffect(() => {
    if (!currentLocation || !userid) return;

    if (!wsServiceRef.current) {
      // wsServiceRef.current = new WebSocketService(WEBSOCKET_API, currentLocation);
      wsServiceRef.current = new WebSocketConnector("/ws/trip", currentLocation);
    }

    const wsService = wsServiceRef.current;

    const listeners: Record<TripEvent, (data: any) => void> = {
      connected: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      },
      disconnected: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      locationUpdate: (data) => setResData(data),
      tripStarted: (data) => setResData(data),
      tripEnded: (data) => setResData(data),
      tripCancelled: (data) => setResData(data),
      tripAllCancalled: (data) => setResData(data),
      error: (err) => setError(err),
    };

    for (const [event, handler] of Object.entries(listeners)) {
      wsService.on(event as TripEvent, handler);
    }

    if (autoConnect) {
      wsService.connectToTrip(userid, rideid).catch(setError);
    }

    return () => {
      for (const [event, handler] of Object.entries(listeners)) {
        wsService.off(event as TripEvent, handler);
      }
    };
  }, [currentLocation, userid, rideid]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      wsServiceRef.current?.disconnect();
    };
  }, []);
 

  // Utility wrappers
  const connect = useCallback(() => {
    if (!wsServiceRef.current || !userid) return;
    wsServiceRef.current.connectToTrip(userid, rideid).catch(setError);
  }, [userid, rideid]);

  const disconnect = useCallback(() => {
    wsServiceRef.current?.disconnect();
    setIsConnected(false);
    setResData(null);
    setError(null);
  }, []);


  const sendLocationUpdate = useCallback(() => {
    const now = Date.now();
    const throttleInterval = 30_000; // 3 seconds

    if (now - lastSentRef.current >= throttleInterval) {
      lastSentRef.current = now;
      wsServiceRef.current?.sendLocationUpdate();
    } else {
      console.log("Throttled location update");
    }
  }, []);


//   const sendLocationUpdate = useCallback(() => {
//     wsServiceRef.current?.sendLocationUpdate();
//   }, []);

  const sendStartTrip = useCallback(() => {
    wsServiceRef.current?.sendStartTrip();
  }, []);

  const sendEndTrip = useCallback((userid: string, rideHistoryid: string) => {
    wsServiceRef.current?.sendEndTrip(userid, rideHistoryid);
  }, []);

  const sendCancelTrip = useCallback((userid: string, rideHistoryid: string) => {
    wsServiceRef.current?.sendCancelTrip(rideHistoryid);
  }, []);

  const sendCancelAllTrip = useCallback(() => {
    wsServiceRef.current?.sendCancelAllTrip();
  }, []);

  return {
    resData,
    isConnected,
    errorWs,
    connect,
    disconnect,
    sendLocationUpdate,
    sendStartTrip,
    sendEndTrip,
    sendCancelTrip,
    sendCancelAllTrip,
  };
};
