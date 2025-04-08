import { ReactNode, useEffect, useState } from 'react';
import { SocketContext } from './context';
import { createSocket } from '@/shared/lib/socket';

/** Пропсы провайдера сокета */
interface SocketProviderProps {
  /** Дочерние элементы */
  children: ReactNode;
}

/** Провайдер сокета */
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket] = useState(() => createSocket());
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // В режиме разработки выводим дополнительную информацию
    const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
    if (isDevMode) {
      console.log('🔌 Подключаем сокет в режиме разработки');
    }
    
    socket.connect();

    socket.on('connect', () => {
      console.debug('✅ Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason: string) => {
      console.debug('⚠️ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ Socket connection error:', error.message);
      
      // В режиме разработки выводим больше информации для отладки
      if (isDevMode) {
        console.log('🛠️ Telegram init data:', window.Telegram?.WebApp?.initData || 'отсутствует');
        console.log('🌐 URL сокета:', socket.io.uri);
      }
    });

    socket.on('error', (error: Error) => {
      console.error('❌ Socket error:', error.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.close();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
