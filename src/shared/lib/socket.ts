import io from 'socket.io-client';

/**
 * Создать сокет-клиент с поддержкой аутентификации для режима разработки и продакшена
 */
export function createSocket() {
  // Проверяем, работаем ли мы в режиме разработки
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  
  // JWT токен для аутентификации (если есть)
  const authToken = localStorage.getItem('authToken');
  
  // Данные Telegram WebApp
  const telegramInitData = window.Telegram?.WebApp?.initData || '';
  
  if (isDevMode) {
    console.log('📶 Создание сокета в режиме разработки');
  }

  // Создаем сокет с управляемыми параметрами подключения
  const socketOptions: Record<string, any> = {
    autoConnect: false,
    withCredentials: true
  };

  // Настраиваем заголовки для HTTP запросов (handshake)
  socketOptions.extraHeaders = {
    'X-Telegram-Init-Data': telegramInitData,
  };
  
  // Добавляем JWT токен в заголовки, если он есть
  if (authToken) {
    socketOptions.extraHeaders['Authorization'] = `Bearer ${authToken}`;
  }
  
  // В режиме разработки добавляем специальный флаг
  if (isDevMode) {
    socketOptions.extraHeaders['X-Development-Mode'] = 'true';
  }

  // Создаем сокет с настроенными параметрами
  const socket = io(import.meta.env.VITE_API_URL, socketOptions);
  
  // Добавляем логирование в режиме разработки
  if (isDevMode) {
    // Логируем события подключения/отключения
    socket.on('connect', () => {
      console.log('💚 Socket успешно подключен');
    });
    
    socket.on('connect_error', (error: Error) => {
      console.error('💔 Socket ошибка подключения:', error.message);
      console.log('📃 Параметры подключения:', socketOptions);
    });
    
    socket.on('disconnect', (reason: string) => {
      console.log('📴 Socket отключен:', reason);
    });
    
    // Мониторим и другие события для отладки
    socket.on('error', (error: Error) => {
      console.error('⚠️ Socket ошибка:', error);
    });
  }

  return socket;
}
