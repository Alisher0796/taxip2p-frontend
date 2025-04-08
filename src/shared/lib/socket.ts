import io from 'socket.io-client';

/**
 * Создает сокет-клиент с правильной передачей Telegram-данных
 * оптимизировано для работы как в режиме разработки, так и в production
 */
export function createSocket() {
  // Получаем телеграм данные для авторизации
  const telegramInitData = window.Telegram?.WebApp?.initData || '';
  const apiUrl = import.meta.env.VITE_API_URL;
  const isDevMode = import.meta.env.DEV;
  const authToken = localStorage.getItem('authToken');
  
  // Настройки для сокета - общие для всех режимов
  // Настройки для сокета - общие для всех режимов
  const socketOptions: any = {
    autoConnect: false,            // Подключаемся сами когда нужно
    reconnection: true,            // Автоматически пробовать переподключиться
    reconnectionDelay: 1000,       // Интервал между попытками переподключения
    reconnectionAttempts: 5,       // Максимальное количество попыток
    timeout: 10000,                // Таймаут подключения (10 сек)
    extraHeaders: {},              // Инициализируем пустыми заголовками
    query: {}                      // Инициализируем пустыми параметрами
  };

  // Добавляем заголовки и параметры для аутентификации
  if (telegramInitData) {
    // Используем extraHeaders вместо query, чтобы избежать ограничений на длину URL
    if (socketOptions.extraHeaders) {
      socketOptions.extraHeaders['Telegram-Init-Data'] = telegramInitData;
    }
    
    if (isDevMode) {
      console.log('🔑 Добавлены Telegram данные в заголовки');
    }
  }
  
  // Добавляем JWT токен авторизации, если есть
  if (authToken && socketOptions.extraHeaders) {
    socketOptions.extraHeaders['Authorization'] = `Bearer ${authToken}`;
    
    if (isDevMode) {
      console.log('🔑 Добавлен JWT токен в заголовки');
    }
  }
  
  // Добавляем параметры запроса (короткие) для компатибильности
  if (socketOptions.query) {
    socketOptions.query = {
      platform: 'telegram',
      version: '1.0.0',
      mode: isDevMode ? 'development' : 'production'
    };
  }
  
  if (isDevMode) {
    console.log('🔍 Создаем сокет для подключения к:', apiUrl);
    console.log('🔑 Telegram initData ' + (telegramInitData ? 'имеется' : 'отсутствует'));
  }
  
  // Создаем и конфигурируем сокет
  const socket = io(apiUrl, socketOptions);
  
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
      console.log('🔑 Проверьте Telegram-Init-Data в заголовках');
    });

    socket.on('error', (error: Error) => {
      console.log('❌ Ошибка сокета:', error.message);
    });
    
    // Обрабатываем события аутентификации
    socket.on('auth_error', (error: any) => {
      console.error('🚫 Ошибка аутентификации:', error);
      // Можно добавить обработку события
    });

    socket.on('auth_success', (data: any) => {
      console.log('👍 Аутентификация успешна:', data);
      // Обработчик успешной аутентификации
    });
  }

  return socket;
}
