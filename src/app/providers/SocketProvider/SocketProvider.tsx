import { ReactNode, useEffect, useState } from 'react';
import { SocketContext } from './context';
import { createSocket } from '@/shared/lib/socket';

/** Пропсы провайдера сокета */
interface SocketProviderProps {
  /** Дочерние элементы */
  children: ReactNode;
}

/**
 * Провайдер сокета для работы с реальным бэкендом на Railway
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket] = useState(() => createSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Определяем режим работы
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  const telegramInitData = window.Telegram?.WebApp?.initData || '';

  // Подключение к сокету и настройка обработчиков событий
  useEffect(() => {
    if (isDevMode) {
      console.log('🔌 Подключение к сокету...');
      console.log('🔑 Telegram initData ' + (telegramInitData ? 'имеется' : 'отсутствует'));
    }

    // Настраиваем обработчики событий
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      if (isDevMode) console.log('💚 Сокет успешно подключен');
    });

    socket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      if (isDevMode) console.log('💔 Сокет отключен:', reason);
      
      // Автоматически пробуем переподключиться в продакшн-режиме
      if (!isDevMode && reason !== 'io client disconnect') {
        // Переподключаемся только при непреднамеренном отключении
        if (isDevMode) console.log('🔄 Автоматическая попытка переподключения...');
      }
    });

    socket.on('connect_error', (error: Error) => {
      setConnectionError(error.message);
      if (isDevMode) {
        console.log('⚠️ Ошибка подключения к сокету:', error.message);
        
        // Подсказки для отладки
        if (!telegramInitData) {
          console.log('🔑 Отсутствуют данные Telegram. В продакшн-режиме открывайте приложение через Telegram.');
        }
      }
    });
    
    socket.on('error', (error: Error) => {
      if (isDevMode) console.log('❌ Ошибка сокета:', error.message);
    });
    
    // Пытаемся подключиться
    socket.connect();

    // Очистка при размонтировании
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.disconnect();
    };
  }, [socket, isDevMode, telegramInitData]);

  // Определяем статус подключения для приложения
  // В режиме разработки приложение всегда работоспособно даже без сокета
  const appConnected = isDevMode ? true : isConnected;
  
  return (
    <SocketContext.Provider value={{ socket, isConnected: appConnected }}>
      {/* Показываем индикатор статуса соединения только в режиме разработки */}
      {isDevMode && !isConnected && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs p-1 text-center z-50">
          {connectionError 
            ? `Ошибка WebSocket: ${connectionError}` 
            : 'Нет подключения к WebSocket (режим разработки)'}
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
}
