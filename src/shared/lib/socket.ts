import io from 'socket.io-client';

/**
 * Функция создания сокет-клиента с необходимыми параметрами
 */
export function createSocket() {
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  const telegramInitData = window.Telegram?.WebApp?.initData || '';
  
  // Создаем макетный объект сокета для режима разработки
  // Это позволит избежать ошибок в консоли
  if (isDevMode) {
    // Не пытаемся подключиться к реальному серверу в режиме разработки
    console.log('🛠️ Создан мок-сокет для режима разработки');
    
    // Реализуем макетный сокет с необходимыми методами
    const mockSocket = {
      connected: false,
      io: { uri: 'mock://localhost' },
      connect: () => {
        console.log('🐞 Мок-сокет: попытка подключения');
        // Не делаем ничего
        return mockSocket;
      },
      disconnect: () => {
        console.log('🐞 Мок-сокет: отключение');
        return mockSocket;
      },
      on: (event: string, _callback: any) => {
        console.log('🐞 Мок-сокет: регистрация обработчика', event);
        return mockSocket;
      },
      off: (event: string) => {
        console.log('🐞 Мок-сокет: удаление обработчика', event);
        return mockSocket;
      },
      emit: (event: string, ...args: any[]) => {
        console.log('🐞 Мок-сокет: отправка события', event, args);
        return mockSocket;
      }
    };
    
    return mockSocket as any;
  }
  
  // Для production используем реальный сокет
  const socket = io(import.meta.env.VITE_API_URL, {
    autoConnect: false, // Не подключаться автоматически при создании
    query: telegramInitData ? { telegramInitData } : undefined, // Передаем данные для аутентификации
  });

  // Добавляем логирование в режиме разработки
  if (isDevMode) {
    socket.on('connect', () => {
      console.log('💚 Socket успешно подключен');
    });
    
    socket.on('connect_error', (error: Error) => {
      console.error('💔 Socket ошибка подключения:', error.message);
      
      // В режиме разработки можно обойтись без WebSocket
      console.log('🛠️ В режиме разработки WebSocket не обязателен для работы приложения');
    });
    
    socket.on('disconnect', (reason: string) => {
      console.log('📴 Socket отключен:', reason);
    });
  }

  return socket;
}
