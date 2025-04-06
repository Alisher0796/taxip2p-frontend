import io from 'socket.io-client';
import type { SocketEvent, SocketResponse } from '@/shared/types/socket';

type DisconnectReason = string;
type SocketError = Error;

/** Создает сокет для работы с API */
export const createSocket = (): ReturnType<typeof io> => {
  const SOCKET_URL = import.meta.env.VITE_API_URL;
  
  if (!SOCKET_URL) {
    throw new Error('VITE_API_URL is not defined');
  }

  const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.debug('Socket connected');
  });

  socket.on('disconnect', (reason: DisconnectReason) => {
    console.debug('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error: SocketError) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error: SocketError) => {
    console.error('Socket error:', error.message);
  });

  socket.on('message', (response: SocketResponse<SocketEvent, unknown>) => {
    console.debug('Socket message:', response);
  });

  return socket;
};
