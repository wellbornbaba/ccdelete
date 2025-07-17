import { WEBSOCKET_API } from '@/utils/fetch';
import mitt, { Emitter } from 'mitt';

type BaseEvents = {
  connected: void;
  disconnected: void;
  error: Error;
  message: any;
};

export class WebSocketConnector<Events extends Record<string, any> = {}> {
  private ws: WebSocket | null = null;
  private emitter: Emitter<Events & BaseEvents> = mitt<Events & BaseEvents>();
  private isConnecting = false;
  private reconnectAttempts = 0;

  constructor(
    private routePath: string,
    private maxReconnectAttempts = 5,
    private reconnectInterval = 3000,
  ) {}

  connect(params?: Record<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) return reject(new Error('Already connecting'));
      this.isConnecting = true;
        const mainUrl = `${WEBSOCKET_API}${this.routePath}`

      const fullUrl = params
        ? `${mainUrl}?${new URLSearchParams(params).toString()}`
        : mainUrl;

      try {
        this.ws = new WebSocket(fullUrl);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emitter.emit('connected' as keyof (Events & BaseEvents), undefined as any);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.emitter.emit('message' as keyof (Events & BaseEvents), message);
          } catch (err) {
            console.error('WebSocket parse error:', err);
            this.emitter.emit('error' as keyof (Events & BaseEvents), err as any);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.emitter.emit('disconnected' as keyof (Events & BaseEvents), undefined as any);
          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect(params);
          }
        };

        this.ws.onerror = (event: any) => {
          this.emitter.emit('error' as keyof (Events & BaseEvents), new Error('WebSocket error') as any);
          reject(event);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(code = 1000, reason = 'Client disconnecting') {
    this.ws?.close(code, reason);
    this.ws = null;
    this.reconnectAttempts = 0;
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not open');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  on<K extends keyof (Events & BaseEvents)>(
    type: K,
    handler: (event: (Events & BaseEvents)[K]) => void,
  ) {
    this.emitter.on(type, handler);
  }

  off<K extends keyof (Events & BaseEvents)>(
    type: K,
    handler: (event: (Events & BaseEvents)[K]) => void,
  ) {
    this.emitter.off(type, handler);
  }

  private scheduleReconnect(params?: Record<string, string>) {
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect(params).catch(() => {});
    }, this.reconnectInterval);
  }
}
