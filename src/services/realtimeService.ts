// Real-time service for live updates and data synchronization

import { analytics } from './analytics';
import logger from '@/utils/Logger';

export interface RealtimeEvent {
  type: string;
  data: unknown;
  timestamp: number;
  userId?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: number;
  reconnectAttempts: number;
  error?: string;
}

class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnectAttempts: 0
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // In a real app, you'd connect to your WebSocket server
    // For now, we'll simulate real-time updates
    this.simulateRealtimeUpdates();
  }

  private simulateRealtimeUpdates(): void {
    // Simulate periodic updates
    setInterval(() => {
      // Simulate new matches
      if (Math.random() < 0.05) { // 5% chance
        this.emit('new_match', {
          matchId: `match_${Date.now()}`,
          userId: 'user_123',
          venueId: 'venue_456',
          timestamp: Date.now()
        });
      }

      // Simulate new messages
      if (Math.random() < 0.1) { // 10% chance
        this.emit('new_message', {
          messageId: `msg_${Date.now()}`,
          matchId: 'match_123',
          senderId: 'user_456',
          content: 'Hey there! 👋',
          timestamp: Date.now()
        });
      }

      // Simulate venue updates
      if (Math.random() < 0.03) { // 3% chance
        this.emit('venue_update', {
          venueId: 'venue_789',
          newUsers: Math.floor(Math.random() * 5) + 1,
          timestamp: Date.now()
        });
      }
    }, 10000); // Every 10 seconds
  }

  // Event system
  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in event listener for ${event}:`, error);
          analytics.trackError(error as Error, { event, data });
        }
      });
    }

    // Track analytics
    analytics.track('realtime_event', { event, data });
  }

  // Connection management
  async connect(url?: string): Promise<void> {
    if (this.isConnecting || this.connectionStatus.connected) {
      return;
    }

    this.isConnecting = true;
    
    try {
      // In a real app, you'd connect to your WebSocket server
      // this.ws = new WebSocket(url || 'wss://your-websocket-server.com');
      
      // For now, simulate connection
      await this.simulateConnection();
      
      this.connectionStatus.connected = true;
      this.connectionStatus.lastConnected = Date.now();
      this.connectionStatus.reconnectAttempts = 0;
      this.connectionStatus.error = undefined;
      
      this.startHeartbeat();
      this.emit('connected', { timestamp: Date.now() });
      
      analytics.track('realtime_connected');
    } catch (error) {
      this.connectionStatus.error = (error as Error).message;
      this.emit('connection_error', { error: this.connectionStatus.error });
      
      if (this.connectionStatus.reconnectAttempts < this.maxReconnectAttempts) {
        await this.reconnect();
      }
    } finally {
      this.isConnecting = false;
    }
  }

  private async simulateConnection(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate occasional connection failures
    if (Math.random() < 0.1) {
      throw new Error('Connection failed');
    }
  }

  private async reconnect(): Promise<void> {
    this.connectionStatus.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts - 1);
    
    this.emit('reconnecting', { 
      attempt: this.connectionStatus.reconnectAttempts,
      delay 
    });
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.connectionStatus.connected = false;
    this.emit('disconnected', { timestamp: Date.now() });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Every 30 seconds
  }

  private sendHeartbeat(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
    }
  }

  // Data synchronization
  subscribeToUser(userId: string): () => void {
    // Subscribe to user-specific updates
    this.emit('subscribe_user', { userId });
    
    return () => {
      this.emit('unsubscribe_user', { userId });
    };
  }

  subscribeToVenue(venueId: string): () => void {
    // Subscribe to venue-specific updates
    this.emit('subscribe_venue', { venueId });
    
    return () => {
      this.emit('unsubscribe_venue', { venueId });
    };
  }

  subscribeToMatch(matchId: string): () => void {
    // Subscribe to match-specific updates
    this.emit('subscribe_match', { matchId });
    
    return () => {
      this.emit('unsubscribe_match', { matchId });
    };
  }

  // Send data
  send(event: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data, timestamp: Date.now() }));
    } else {
      // Fallback to local event emission
      this.emit(event, data);
    }
  }

  // Status and utilities
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  isConnected(): boolean {
    return this.connectionStatus.connected;
  }

  // Specific real-time features
  startTypingIndicator(matchId: string): void {
    this.send('typing_start', { matchId, timestamp: Date.now() });
  }

  stopTypingIndicator(matchId: string): void {
    this.send('typing_stop', { matchId, timestamp: Date.now() });
  }

  updateUserPresence(status: 'online' | 'away' | 'offline'): void {
    this.send('presence_update', { status, timestamp: Date.now() });
  }

  updateUserLocation(latitude: number, longitude: number): void {
    this.send('location_update', { latitude, longitude, timestamp: Date.now() });
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Export convenience functions
export const subscribeToUser = (userId: string) => realtimeService.subscribeToUser(userId);
export const subscribeToVenue = (venueId: string) => realtimeService.subscribeToVenue(venueId);
export const subscribeToMatch = (matchId: string) => realtimeService.subscribeToMatch(matchId);
export const isRealtimeConnected = () => realtimeService.isConnected();
export const getRealtimeStatus = () => realtimeService.getConnectionStatus(); 