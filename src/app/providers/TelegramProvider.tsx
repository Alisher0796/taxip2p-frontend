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
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let initTimeout: NodeJS.Timeout;

    const initWebApp = async () => {
      try {
        // Проверяем наличие WebApp
        if (!window.Telegram?.WebApp) {
          console.warn('Telegram WebApp SDK not available');
          return false;
        }

        const webApp = window.Telegram.WebApp;

        // Добавляем обработчик события готовности
        webApp.onEvent('viewportChanged', () => {
          console.log('Viewport changed, checking WebApp state...');
          if (webApp.initData && webApp.initDataUnsafe?.user) {
            console.log('WebApp initialized:', {
              version: webApp.version,
              platform: webApp.platform,
              initData: webApp.initData,
              user: webApp.initDataUnsafe.user
            });
            setWebApp(webApp);
            setUser(webApp.initDataUnsafe.user);
            setIsWebAppReady(true);
          }
        });

        // Проверяем текущее состояние
        if (webApp.initData && webApp.initDataUnsafe?.user) {
          console.log('WebApp already initialized:', {
            version: webApp.version,
            platform: webApp.platform,
            initData: webApp.initData,
            user: webApp.initDataUnsafe.user
          });
          setWebApp(webApp);
          setUser(webApp.initDataUnsafe.user);
          setIsWebAppReady(true);
        }

        // Сообщаем о готовности и разворачиваем окно
        webApp.ready();
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
      if (success && window.Telegram?.WebApp) {
        const app = window.Telegram.WebApp;
        setWebApp(app);
        setUser(app.initDataUnsafe?.user || null);
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
      if (webApp) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      if (webApp) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    }
  }

  const value = {
    webApp,
    user,
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
