import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
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

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
