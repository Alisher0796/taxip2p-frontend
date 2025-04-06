import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import type { SocketEvent, SocketResponse } from '@/shared/types/socket';

/** Хук для работы с сокетами */
export function useSocket(socket: ReturnType<typeof io> | null) {
  /** Подписка на событие */
  const subscribe = useCallback(<E extends SocketEvent, P>(
    event: E,
    callback: (data: P) => void,
  ) => {
    if (!socket) {
      console.warn('Socket is not available');
      return () => {};
    }

    const handler = (response: SocketResponse<P>) => {
      try {
        callback(response.data);
      } catch (error) {
        console.error(`Error handling socket event ${event}:`, error);
      }
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket]);

  /** Отправка события */
  const emit = useCallback(<T = unknown>(event: string, data?: T) => {
    if (!socket) {
      console.warn('Socket is not available');
      return;
    }

    try {
      socket.emit(event, data);
    } catch (error) {
      console.error(`Error emitting socket event ${event}:`, error);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      console.warn('Socket is not available');
      return;
    }

    socket.on('connect', () => {
      console.debug('Socket connected');
    });

    socket.on('disconnect', (reason: string) => {
      console.debug('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
    };
  }, [socket]);

  return {
    subscribe,
    emit,
    isConnected: socket?.connected ?? false,
  };
}
