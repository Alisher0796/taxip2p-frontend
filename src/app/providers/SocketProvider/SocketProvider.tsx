import { ReactNode, useEffect, useState } from 'react';
import { SocketContext } from './context';
import { createSocket } from '@/shared/lib/socket';

/** Пропсы провайдера сокета */
interface SocketProviderProps {
  /** Дочерние элементы */
  children: ReactNode;
}

/**
 * Провайдер сокета с улучшенной стабильностью и поддержкой режима разработки
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket] = useState(() => createSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  
  // Проверяем, работаем ли мы в режиме разработки
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

  // Попытка подключиться к сокету (только один раз)
  useEffect(() => {
    if (connectionAttempted) {
      return; // Не делаем повторных попыток
    }
    
    // Отмечаем, что попытка была сделана
    setConnectionAttempted(true);
    
    if (isDevMode) {
      console.log('🌐 Попытка подключения к сокету в режиме разработки');
    }
    
    // Регистрируем обработчики событий
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('💚 Сокет успешно подключен');
    });

    socket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      console.log('💔 Сокет отключен:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.log('🚫 Ошибка подключения к сокету:', error.message);
      
      // В режиме разработки продолжаем работу без сокета
      if (isDevMode) {
        console.log('🛠️ В режиме разработки приложение может работать без WebSocket');
        // Не делаем повторных попыток подключения
      }
    });
    
    // Пытаемся подключиться
    socket.connect();

    // Очистка при размонтировании
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [socket, connectionAttempted, isDevMode]);

  // В режиме разработки всегда считаем приложение работоспособным, даже без сокета
  const devModeConnected = isDevMode ? true : isConnected;
  
  return (
    <SocketContext.Provider value={{ socket, isConnected: devModeConnected }}>
      {isDevMode && !isConnected && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs p-1 text-center">
          Нет соединения с WebSocket (режим разработки)
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
}
