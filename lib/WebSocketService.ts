import mitt, { Emitter } from 'mitt';
import { LocationProps } from '@/types';
import { TripMonitoringProps } from '@/types/vehicle';
import { WebSocketMessage } from '@/types/ws';

type Events = {
  connected: void;
  disconnected: void;
  error: Error;
  tripStatusUpdate: any;
  tripUpdate: TripMonitoringProps;
  chatMessage: any;
  notification: any;
  tripStarted: any;
  tripEnded: any;
  tripCancelled: any;
  tripAllCancalled: any;
  locationUpdate: any;
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;
  private serverUrl: string;
  private currentLocation?: LocationProps | null;
  private currentUserid: string | null = null;
  private currentRideid: string | null = null;

  private emitter: Emitter<Events> = mitt<Events>();

  constructor(
    serverUrl: string = 'ws://localhost:3000',
    currentLocation: LocationProps,
  ) {
    this.serverUrl = serverUrl;
    this.currentLocation = currentLocation;
  }

  // WebSocket connection
  connectToTrip(userid: string, rideid?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.currentUserid = userid;
      this.currentRideid = rideid || null;
      this.isConnecting = true;

      try {
        this.ws = new WebSocket(`${this.serverUrl}/ws/trip`);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          if (rideid) {
            this.send({
              type: 'locationUpdate',
              rideid: this.currentRideid,
              userid: this.currentUserid,
              currentLocation: this.currentLocation,
            });
          }

          this.emitter.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.emitter.emit('disconnected');

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event: any) => {
          console.error('WebSocket error:', event);
          this.isConnecting = false;
          this.emitter.emit('error', new Error('WebSocket Error'));
          reject(event);
        };
      } catch (error: any) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'locationUpdate':
        this.emitter.emit('locationUpdate', message.data);
        break;

      case 'tripStarted':
        this.emitter.emit('tripStarted', message.data);
        break;

      case 'tripEnded':
        this.emitter.emit('tripEnded', message.data);
        break;

      case 'tripCancelled':
        this.emitter.emit('tripCancelled', message.data);
        break;
      case 'tripAllCancalled':
        this.emitter.emit('tripAllCancalled', message.data);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  sendLocationUpdate() {
    if (!this.currentUserid || !this.currentRideid) return;

    this.send({
      type: 'locationUpdate',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      currentLocation: this.currentLocation,
    });
  }

  sendStartTrip() {
    if (!this.currentUserid || !this.currentRideid) return;

    this.send({
      type: 'tripStarted',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      currentLocation: this.currentLocation,
    });
  }

  sendEndTrip(passengerUserid: string, historyid: string) {
    if (
      !this.currentUserid ||
      !this.currentRideid ||
      !passengerUserid ||
      !historyid
    )
      return;

    this.send({
      type: 'tripEnded',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      passengerid: passengerUserid,
      historyid: historyid,
      currentLocation: this.currentLocation,
    });
  }

  sendCancelTrip(historyid: string) {
    if (!this.currentUserid || !this.currentRideid || !historyid) return;

    this.send({
      type: 'tripCancelled',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      historyid: historyid,
      currentLocation: this.currentLocation,
    });
  }

  sendCancelAllTrip() {
    if (!this.currentUserid || !this.currentRideid) return;

    this.send({
      type: 'tripAllCancalled',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      currentLocation: this.currentLocation,
    });
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      if (this.currentUserid) {
        this.connectToTrip(
          this.currentUserid,
          this.currentRideid || undefined,
        ).catch(() => {});
      }
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.currentUserid && this.currentRideid) {
      this.send({
        type: 'disconnected',
        userid: this.currentUserid,
        rideid: this.currentRideid,
      });
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this.currentUserid = null;
    this.currentRideid = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Subscriptions
  on<K extends keyof Events>(type: K, handler: (event: Events[K]) => void) {
    this.emitter.on(type, handler);
  }

  off<K extends keyof Events>(type: K, handler: (event: Events[K]) => void) {
    this.emitter.off(type, handler);
  }
}

export default WebSocketService;
