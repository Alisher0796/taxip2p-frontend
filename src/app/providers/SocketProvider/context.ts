import { createContext } from 'react';
import io from 'socket.io-client';

/** Контекст сокета */
export interface SocketContextType {
  /** Инстанс сокета */
  socket: ReturnType<typeof io> | null;
  /** Статус подключения */
  isConnected: boolean;
}

/** Контекст сокета */
export const SocketContext = createContext<SocketContextType>({} as SocketContextType);
