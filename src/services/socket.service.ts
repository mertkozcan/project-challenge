import { io, Socket } from 'socket.io-client';
import { showErrorNotification, showInfoNotification, showWarningNotification } from '@/utils/notifications';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket?.id);
        this.reconnectAttempts = 0;
        
        // Only show notification if this is a reconnection
        if (this.reconnectAttempts > 0) {
          showInfoNotification('Connection restored', 'Connected');
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, manual reconnection needed
          showWarningNotification(
            'You have been disconnected from the server.',
            'Disconnected'
          );
        } else if (reason === 'transport close' || reason === 'ping timeout') {
          // Connection lost, will auto-reconnect
          showWarningNotification(
            'Connection lost. Attempting to reconnect...',
            'Connection Lost'
          );
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt:', attemptNumber);
        this.reconnectAttempts = attemptNumber;
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Reconnection failed after max attempts');
        showErrorNotification(
          'Unable to reconnect to the server. Please refresh the page.',
          'Connection Failed'
        );
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        showInfoNotification('Successfully reconnected to the server', 'Reconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        showErrorNotification(
          'A connection error occurred. Please try again.',
          'Connection Error'
        );
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        
        if (this.reconnectAttempts === 0) {
          // First connection attempt failed
          showErrorNotification(
            'Unable to connect to the server. Please check your connection.',
            'Connection Error'
          );
        }
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, userId: string): void {
    this.socket?.emit('join-room', { roomId, userId });
  }

  leaveRoom(roomId: string, userId: string): void {
    this.socket?.emit('leave-room', { roomId, userId });
  }

  completeCell(roomId: string, cellId: number, userId: string): void {
    this.socket?.emit('complete-cell', { roomId, cellId, userId });
  }

  startGame(roomId: string, userId: string): void {
    this.socket?.emit('start-game', { roomId, userId });
  }

  toggleReady(roomId: string, userId: string): void {
    this.socket?.emit('toggle-ready', { roomId, userId });
  }

  joinUserRoom(userId: string): void {
    this.socket?.emit('join-user-room', { userId });
  }

  sendMessage(roomId: string, userId: string, username: string, message: string, type: 'TEXT' | 'QUICK' = 'TEXT'): void {
    this.socket?.emit('send-message', { roomId, userId, username, message, type });
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
