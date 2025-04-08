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
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Определяем режим работы
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  const inTelegram = !!window.Telegram?.WebApp;
  const telegramInitData = window.Telegram?.WebApp?.initData || '';

  // Подключение к сокету и настройка обработчиков
  useEffect(() => {
    if (isDevMode) {
      console.log('🔌 Подключение к сокету...');
      console.log('🔑 Среда:', inTelegram ? 'Telegram WebApp' : 'Браузер');
      console.log('🔑 InitData ' + (telegramInitData ? 'имеется (' + telegramInitData.substring(0, 20) + '...)' : 'отсутствует'));
    }

    // Настраиваем обработчики событий
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
      if (isDevMode) console.log('💚 Сокет успешно подключен');
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      if (isDevMode) console.log('💔 Сокет отключен:', reason);
      
      // Автоматически переподключаемся в продакшне
      if ((!isDevMode || inTelegram) && reason !== 'io client disconnect') {
        setIsReconnecting(true);
        if (isDevMode) console.log('🔄 Автоматическая попытка переподключения...');
      }
    };

    const onConnectError = (error: Error) => {
      setConnectionError(error.message);
      if (isDevMode) {
        console.log('⚠️ Ошибка подключения к сокету:', error.message);
        
        // Подсказки в зависимости от типа ошибки
        if (!telegramInitData && !isDevMode) {
          console.log('🔑 Отсутствуют данные Telegram. Откройте приложение через Telegram.');
        }
      }
    };
    
    // Регистрируем обработчики
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    
    // Обработчики аутентификации
    socket.on('auth_error', (error: any) => {
      if (isDevMode) console.error('🚫 Ошибка аутентификации:', error);
      setConnectionError('Auth error: ' + (typeof error === 'string' ? error : JSON.stringify(error)));
    });
    
    // Пытаемся подключиться
    if (!socket.connected) {
      socket.connect();
    }

    // Очистка при размонтировании
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('auth_error');
      socket.disconnect();
    };
  }, [socket, isDevMode, inTelegram, telegramInitData]);

  // Определяем статус подключения для приложения
  // В режиме разработки приложение всегда работоспособно даже без сокета
  const appConnected = isDevMode ? true : isConnected;
  
  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected: appConnected,
      connectionError,
      isReconnecting 
    }}>
      {/* Показываем индикатор статуса соединения только в режиме разработки */}
      {isDevMode && !isConnected && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs p-1 text-center z-50">
          {isReconnecting 
            ? 'Попытка переподключения к WebSocket...' 
            : connectionError 
              ? `Ошибка WebSocket: ${connectionError}` 
              : 'Нет подключения к WebSocket'}
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
}
