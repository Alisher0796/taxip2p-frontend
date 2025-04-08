import io from 'socket.io-client';

/**
 * Создает сокет-клиент с необходимыми настройками для подключения к бэкенду на Railway
 */
export function createSocket() {
  // Получаем телеграм данные для авторизации
  const telegramInitData = window.Telegram?.WebApp?.initData || '';
  const apiUrl = import.meta.env.VITE_API_URL;
  const isDevMode = import.meta.env.DEV;
  
  if (isDevMode) {
    console.log('🔍 Создаем сокет для подключения к:', apiUrl);
    console.log('🔑 Telegram initData ' + (telegramInitData ? 'имеется' : 'отсутствует'));
  }
  
  // Создаем сокет с оптимальными настройками
  const socket = io(apiUrl, {
    // Базовые настройки
    autoConnect: false,            // Подключаемся сами когда нужно
    reconnection: true,            // Автоматически пробовать переподключиться
    reconnectionDelay: 1000,       // Интервал между попытками переподключения
    reconnectionAttempts: 5,       // Максимальное количество попыток
    timeout: 10000,                // Таймаут подключения (10 сек)
    
    // Аутентификационные данные
    query: {
      telegramInitData: telegramInitData  // Передаем данные для аутентификации
    }
  });
  
  // Добавляем логирование в режиме разработки
  if (isDevMode) {
    socket.on('connect', () => {
      console.log('💚 Сокет подключен!');
    });

    socket.on('disconnect', (reason: string) => {
      console.log('💔 Сокет отключился:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.log('⚠️ Ошибка подключения к сокету:', error.message);
      console.log('🔍 Проверьте URL:', apiUrl);
      console.log('🔑 Проверьте наличие telegramInitData');
    });

    socket.on('error', (error: Error) => {
      console.log('❌ Ошибка сокета:', error.message);
    });
  }

  return socket;
}
