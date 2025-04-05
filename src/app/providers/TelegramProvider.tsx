import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Получаем доступ к глобальному объекту Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: any
    }
  }
}



interface TelegramContextType {
  webApp: any | null
  user: any | null
  isReady: boolean
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
  }
}

const TelegramContext = createContext<TelegramContextType | null>(null)

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isWebAppReady, setIsWebAppReady] = useState(false);

  useEffect(() => {
    let initTimeout: NodeJS.Timeout;

    const initWebApp = async () => {
      try {
        // Проверяем, что WebApp доступен
        if (!window.Telegram?.WebApp) {
          console.warn('Telegram WebApp SDK not available')
          return false;
        }

        const webApp = window.Telegram.WebApp;

        // На iOS иногда требуется время для инициализации
        if (!webApp.initData) {
          console.log('Waiting for WebApp initialization...');
          return false;
        }

        // Логируем информацию о WebApp
        console.log('WebApp:', webApp);
        console.log('WebApp init data:', webApp.initData);
        console.log('WebApp init data unsafe:', webApp.initDataUnsafe);
        console.log('WebApp user:', webApp.initDataUnsafe.user);
        console.log('WebApp platform:', webApp.platform);
        console.log('WebApp version:', webApp.version);

        // Сообщаем о готовности и разворачиваем окно
        webApp.ready();
        webApp.expand();
        
        return true;
      } catch (error) {
        console.warn('Error initializing Telegram WebApp:', error);
        return false;
      }
    };

    // Пытаемся инициализировать WebApp каждые 100мс в течение 3 секунд
    let attempts = 0;
    const maxAttempts = 30; // 3 секунды

    const tryInit = async () => {
      if (attempts >= maxAttempts) {
        console.error('Failed to initialize Telegram WebApp after multiple attempts');
        return;
      }

      const success = await initWebApp();
      if (success) {
        setIsWebAppReady(true);
      } else {
        attempts++;
        initTimeout = setTimeout(tryInit, 100);
      }
    };

    tryInit();

    // Очистка при размонтировании
    return () => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }

      try {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
      } catch (error) {
        console.warn('Error closing Telegram WebApp:', error);
      }
    };
  }, []);

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      }
    }
  }

  const value = {
    webApp: isWebAppReady && window.Telegram?.WebApp ? window.Telegram.WebApp : null,
    user: isWebAppReady && window.Telegram?.WebApp ? window.Telegram.WebApp.initDataUnsafe.user : null,
    isReady: isWebAppReady,
    haptic
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}
