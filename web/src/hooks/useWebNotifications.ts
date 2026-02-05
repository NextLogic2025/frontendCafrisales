import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';

const BASE =
  (import.meta.env.VITE_NOTIFICATIONS_WS_URL as string) ||
  (import.meta.env.VITE_NOTIFICATIONS_BASE_URL as string) ||
  env.api.notifications;

export interface NotificationPayload {
  id: string;
  titulo: string;
  mensaje: string;
  tipoId: string;
  payload?: any;
  creadoEn: string;
}

export const useWebNotifications = (token: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    if (!token) return;

    const cleanToken = token.replace(/^Bearer\s+/i, '');
    const url = `${BASE.replace(/\/$/, '')}/notifications`;

    const socketInstance = io(url, {
      auth: { token: cleanToken },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      autoConnect: true,
    });

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));
    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    socketInstance.on('notification', (data: NotificationPayload) => {
      setNotifications((prev) => [data, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket, isConnected, notifications } as const;
};
