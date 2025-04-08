/**
 * Утилита для безопасной работы с Telegram API
 * Помогает избежать ошибок в разных средах (телефон, браузер)
 */

// Безопасный доступ к Telegram WebApp
export function safeWebApp() {
  try {
    if (window.Telegram?.WebApp) {
      return window.Telegram.WebApp;
    }
  } catch (e) {
    console.warn('Ошибка доступа к Telegram WebApp:', e);
  }
  return null;
}

// Безопасное выполнение метода Telegram
export function safeTelegramCall<T>(callback: () => T, fallback: T): T {
  try {
    return callback();
  } catch (e) {
    console.warn('Ошибка при вызове метода Telegram:', e);
    return fallback;
  }
}

// Безопасный метод ready для WebApp
export function safeReady() {
  try {
    const webApp = safeWebApp();
    if (webApp && typeof webApp.ready === 'function') {
      webApp.ready();
    }
  } catch (e) {
    console.warn('Ошибка при вызове WebApp.ready():', e);
  }
}

// Безопасный метод expand для WebApp
export function safeExpand() {
  try {
    const webApp = safeWebApp();
    if (webApp && typeof webApp.expand === 'function') {
      webApp.expand();
    }
  } catch (e) {
    console.warn('Ошибка при вызове WebApp.expand():', e);
  }
}

// Определение типов для TypeScript
declare global {
  interface Window {
    SafeTelegramGameProxy?: {
      receiveEvent: (eventName: string, eventData: any) => void;
      postEvent: (eventName: string, eventData: any) => boolean;
    };
  }
}
