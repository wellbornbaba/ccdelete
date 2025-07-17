import { WebSocketConnector } from './WebSocketConnector';
import { LocationProps } from '@/types';
import { TripMonitoringProps } from '@/types/vehicle';
import { WebSocketMessage } from '@/types/ws';

type TripEvents = {
  tripUpdate: TripMonitoringProps;
  tripStarted: any;
  tripEnded: any;
  tripCancelled: any;
  tripAllCancalled: any;
  locationUpdate: any;
};

export class TripWs {
  private connector: WebSocketConnector<TripEvents>;
  private currentUserid: string | null = null;
  private currentRideid: string | null = null;
  private currentLocation?: LocationProps;

  constructor(currentLocation: LocationProps) {
    this.connector = new WebSocketConnector<TripEvents>(`/ws/trip`);
    this.currentLocation = currentLocation;

    this.connector.on('message', (msg: WebSocketMessage) => this.handleMessage(msg));
  }

  async connect(userid: string, rideid?: string) {
    this.currentUserid = userid;
    this.currentRideid = rideid || null;

    await this.connector.connect();
    if (rideid) this.sendLocationUpdate();
  }

  disconnect() {
    if (this.currentUserid && this.currentRideid) {
      this.send({ type: 'disconnected', userid: this.currentUserid, rideid: this.currentRideid });
    }
    this.connector.disconnect();
    this.currentUserid = null;
    this.currentRideid = null;
  }

  sendLocationUpdate() {
    if (!this.currentUserid || !this.currentRideid) return;
    this.send({
      type: 'locationUpdate',
      userid: this.currentUserid,
      rideid: this.currentRideid,
      currentLocation: this.currentLocation,
    });
  }

  sendStartTrip() {
    if (!this.currentUserid || !this.currentRideid) return;
    this.send({
      type: 'tripStarted',
      userid: this.currentUserid,
      rideid: this.currentRideid,
      currentLocation: this.currentLocation,
    });
  }

  sendEndTrip(passengerUserid: string, historyid: string) {
    if (!this.currentUserid || !this.currentRideid) return;
    this.send({
      type: 'tripEnded',
      userid: this.currentUserid,
      rideid: this.currentRideid,
      passengerid: passengerUserid,
      historyid,
      currentLocation: this.currentLocation,
    });
  }

  sendCancelTrip(historyid: string) {
    if (!this.currentUserid || !this.currentRideid) return;
    this.send({
      type: 'tripCancelled',
      userid: this.currentUserid,
      rideid: this.currentRideid,
      historyid,
      currentLocation: this.currentLocation,
    });
  }

  sendCancelAllTrip() {
    if (!this.currentUserid || !this.currentRideid) return;
    this.send({
      type: 'tripAllCancalled',
      userid: this.currentUserid,
      rideid: this.currentRideid,
      currentLocation: this.currentLocation,
    });
  }

  private handleMessage(message: WebSocketMessage) {
    if (message?.type && this.connector) {
      this.connector['emitter'].emit(message.type as keyof TripEvents, message.data);
    }
  }

  private send(data: any) {
    this.connector.send(data);
  }

  on<K extends keyof TripEvents>(type: K, handler: (event: TripEvents[K]) => void) {
    this.connector.on(type, handler);
  }

  off<K extends keyof TripEvents>(type: K, handler: (event: TripEvents[K]) => void) {
    this.connector.off(type, handler);
  }

  isConnected(): boolean {
    return this.connector.isConnected();
  }
}
