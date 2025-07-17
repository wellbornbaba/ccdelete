import { useEffect, useRef, useState, useCallback } from 'react';
import { UseWebSocketReturn } from '@/types/ws';
import { TripMonitoringProps } from '@/types/vehicle';
import WebSocketService from '@/lib/WebSocketService';
import { accountTypeProps, LocationProps } from '@/types';

interface UseWebSocketProps {
  serverUrl?: string;
  userId: string;
  rideId?: string;
  autoConnect?: boolean;
}

export const useWebSocket = ({
  serverUrl = 'ws://localhost:3000',
  userId,
  rideId,
  autoConnect = true,
}: UseWebSocketProps): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [tripData, setTripData] = useState<TripMonitoringProps | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const wsServiceRef = useRef<WebSocketService | null>(null);

  // Initialize WebSocket service
  useEffect(() => {
    if (!wsServiceRef.current) {
      wsServiceRef.current = new WebSocketService(serverUrl);
    }

    const wsService = wsServiceRef.current;

    // Event listeners
    const handleConnected = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    const handleError = (err: Error) => {
      console.error('WebSocket error:', err);
      setError(err);
      setIsConnected(false);
    };

    const handleTripUpdate = (data: TripMonitoringProps) => {
      console.log('Trip update received in hook:', data);
      setTripData(data);
    };

    const handleTripStatusUpdate = (data: any) => {
      console.log('Trip status update:', data);
      // You can emit custom events or handle status updates here
    };

    const handleChatMessage = (data: any) => {
      console.log('Chat message received:', data);
      // Handle chat messages if needed
    };

    const handleNotification = (data: any) => {
      console.log('Notification received:', data);
      // Handle notifications if needed
    };

    // Attach event listeners
    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('error', handleError);
    wsService.on('tripUpdate', handleTripUpdate);
    wsService.on('tripStatusUpdate', handleTripStatusUpdate);
    wsService.on('chatMessage', handleChatMessage);
    wsService.on('notification', handleNotification);

    // Auto-connect if enabled
    if (autoConnect && userId) {
      wsService.connectToTrip(userId, rideId).catch(setError);
    }

    // Cleanup function
    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('error', handleError);
      wsService.off('tripUpdate', handleTripUpdate);
      wsService.off('tripStatusUpdate', handleTripStatusUpdate);
      wsService.off('chatMessage', handleChatMessage);
      wsService.off('notification', handleNotification);
    };
  }, [serverUrl, userId, rideId, autoConnect]);

  // Connect function
  const connect = useCallback(async () => {
    if (!wsServiceRef.current || !userId) {
      throw new Error('WebSocket service not initialized or userId missing');
    }

    try {
      await wsServiceRef.current.connectToTrip(userId, rideId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId, rideId]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      setIsConnected(false);
      setTripData(null);
      setError(null);
    }
  }, []);

  // Send location update
  const sendLocationUpdate = useCallback((
    location: LocationProps,
    accountType: accountTypeProps
  ) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.sendLocationUpdate(location, accountType);
    }
  }, []);

  // Send status update
  const sendStatusUpdate = useCallback((status: string, data?: any) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.sendStatusUpdate(status, data);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    tripData,
    error,
    connect,
    disconnect,
    sendLocationUpdate,
    sendStatusUpdate,
  };
};
