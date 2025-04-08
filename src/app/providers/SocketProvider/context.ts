import { createContext } from 'react';
import io from 'socket.io-client';

/** Контекст сокета с расширенными свойствами */
export interface SocketContextType {
  /** Инстанс сокета */
  socket: ReturnType<typeof io> | null;
  /** Статус подключения */
  isConnected: boolean;
  /** Сообщение об ошибке подключения, если есть */
  connectionError?: string | null;
  /** В процессе переподключения */
  isReconnecting?: boolean;
}

/** Контекст сокета */
export const SocketContext = createContext<SocketContextType>({} as SocketContextType);
