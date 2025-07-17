import { accountTypeProps, LocationProps } from '@/types';
import { TripMonitoringProps } from '@/types/vehicle';
import { WebSocketMessage } from '@/types/ws';
import { EventEmitter } from 'events';


class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;
  private serverUrl: string;
  private currentLocation?: LocationProps | null;
  private currentUserid: string | null = null;
  private currentRideid: string | null = null;

  constructor(serverUrl: string = 'ws://localhost:3000', currentLocation: LocationProps) {
    super();
    this.serverUrl = serverUrl;
    this.currentLocation = currentLocation;
  }

  // Connect to trip WebSocket
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
          console.log('Connected to trip WebSocket');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Join the trip
          if (rideid) {
            this.send({
              type: 'join',
              userid,
              rideid,
            });
          }

          this.emit('connected');
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
          console.log('Trip WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('disconnected');
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('Trip WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'trip-update':
        this.handleTripUpdate(message.data);
        break;
      
      case 'trip-status':
        this.emit('tripStatusUpdate', message.data);
        break;
      
      case 'chat-message':
        this.emit('chatMessage', message.data);
        break;
      
      case 'notification':
        this.emit('notification', message.data);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleTripUpdate(data: TripMonitoringProps) {
    console.log('Trip update received:', data);
    this.emit('tripUpdate', data);
  }

  // Send location update
  sendLocationUpdate(accountType: accountTypeProps) {
    if (!this.currentUserid || !this.currentRideid) {
      console.error('Cannot proceed: missing userId or rideId');
      return;
    }

    this.send({
      type: 'locationUpdate',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      accountType,
      currentLocation: this.currentLocation,
    });
  }

  // start ride
  sendStartTrip(){
    if (!this.currentUserid || !this.currentRideid) {
      console.error('Cannot proceed: missing userId or rideId');
      return;
    }

    this.send({
      type: 'tripStarted',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      currentLocation: this.currentLocation,
    });
  }

  // start ride
  sendEndTrip(passengerUserid: string){
    if (!this.currentUserid || !this.currentRideid || !passengerUserid) {
      console.error('Cannot proceed: missing userId or rideId');
      return;
    }

    this.send({
      type: 'tripEnded',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      passengerid: passengerUserid,
      currentLocation: this.currentLocation,
    });
  }

    // Cancel ride
  sendCancelTrip(passengerUserid: string){
    if (!this.currentUserid || !this.currentRideid || !passengerUserid) {
      console.error('Cannot proceed: missing userId or rideId');
      return;
    }

    this.send({
      type: 'tripCancelled',
      rideid: this.currentRideid,
      userid: this.currentUserid,
      passengerid: passengerUserid,
      currentLocation: this.currentLocation,
    });
  }
  

  // Generic send method
  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected');
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
    
    setTimeout(() => {
      if (this.currentUserid) {
        this.connectToTrip(this.currentUserid, this.currentRideid || undefined);
      }
    }, this.reconnectInterval);
  }

  // Disconnect from WebSocket
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

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService;
