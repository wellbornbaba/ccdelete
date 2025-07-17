import { TripEvent } from "@/hooks/useTripTracking";
import { accountTypeProps, LocationProps } from ".";
import { TripMonitoringProps } from "./vehicle";

export interface WebSocketMessage {
  type: TripEvent;
  status: boolean;
  message: string;
  data?: any;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  tripData: TripMonitoringProps | null;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendLocationUpdate: (location: LocationProps, accountType: accountTypeProps) => void;
  sendStatusUpdate: (status: string, data?: any) => void;
}
