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
    let checkTimeout: NodeJS.Timeout;

    const waitForTelegramWebApp = () => {
      return new Promise<boolean>((resolve) => {
        const check = () => {
          if (window.Telegram?.WebApp) {
            resolve(true);
          } else {
            checkTimeout = setTimeout(check, 100);
          }
        };
        check();
      });
    };

    const initWebApp = async () => {
      try {
        // Ждем появления объекта Telegram.WebApp
        const webAppAvailable = await waitForTelegramWebApp();
        if (!webAppAvailable || !window.Telegram?.WebApp) {
          console.warn('Telegram WebApp SDK not available');
          return false;
        }

        const webApp = window.Telegram.WebApp;

        // Проверяем наличие необходимых данных
        if (!webApp.initData || !webApp.initDataUnsafe?.user) {
          console.log('Waiting for WebApp initialization...', {
            initData: webApp.initData,
            initDataUnsafe: webApp.initDataUnsafe
          });
          return false;
        }

        // Логируем информацию о WebApp
        if (webApp.version) console.log('WebApp version:', webApp.version);
        if (webApp.platform) console.log('WebApp platform:', webApp.platform);
        if (webApp.initDataUnsafe?.user) console.log('WebApp user:', webApp.initDataUnsafe.user);

        // Сообщаем о готовности
        webApp.ready();
        
        // Разворачиваем окно только после успешной инициализации
        webApp.expand();
        
        return true;
      } catch (error) {
        console.warn('Error initializing Telegram WebApp:', error);
        return false;
      }
    };

    // Пытаемся инициализировать WebApp каждые 100мс в течение 5 секунд
    let attempts = 0;
    const maxAttempts = 50; // 5 секунд

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
      if (checkTimeout) {
        clearTimeout(checkTimeout);
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
