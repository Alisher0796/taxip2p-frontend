import io from 'socket.io-client';

/** Создать сокет-клиент */
export function createSocket() {
  // Получаем данные инициализации Telegram или используем заглушку для режима разработки
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  const telegramInitData = window.Telegram?.WebApp?.initData || '';

  // Добавляем данные Telegram для аутентификации
  const socketUrl = new URL(import.meta.env.VITE_API_URL);
  
  // В режиме разработки или если есть данные Telegram, добавляем их в URL
  if (telegramInitData || isDevMode) {
    // Добавляем в URL как параметр
    socketUrl.searchParams.append('telegramInitData', telegramInitData);
  }

  // Создаем сокет с базовыми опциями
  const socket = io(socketUrl.toString(), {
    transports: ['websocket'],
    autoConnect: false
  });

  return socket;
}
