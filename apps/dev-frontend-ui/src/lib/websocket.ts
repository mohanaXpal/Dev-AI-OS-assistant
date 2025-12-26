import { io, Socket } from 'socket.io-client';

export interface ActivityEvent {
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
}

class WebSocketManager {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    connect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.socket?.connected) {
                resolve();
                return;
            }

            // Backend runs on 3001
            this.socket = io('http://localhost:3001', {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket.io connected');
                resolve();
            });

            this.socket.on('disconnect', () => {
                console.log('⚠️ Socket.io disconnected');
            });

            this.socket.onAny((eventName, data) => {
                if (this.listeners.has(eventName)) {
                    this.listeners.get(eventName)!.forEach(cb => cb(data));
                }
            });
        });
    }

    on(eventType: string, callback: (data: any) => void) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);

        return () => {
            this.listeners.get(eventType)!.delete(callback);
        };
    }

    send(eventType: string, data: any) {
        if (this.socket?.connected) {
            this.socket.emit(eventType, data);
        } else {
            console.warn('Socket is not connected');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const wsManager = new WebSocketManager();
