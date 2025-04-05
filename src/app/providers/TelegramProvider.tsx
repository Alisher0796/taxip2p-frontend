import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import WebApp from '@twa-dev/sdk'

interface TelegramContextType {
  webApp: typeof WebApp | null
  user: typeof WebApp['initDataUnsafe']['user'] | null
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
        if (typeof WebApp === 'undefined') {
          console.warn('Telegram WebApp SDK not available')
          return false;
        }

        // На iOS иногда требуется время для инициализации
        if (!WebApp.initData) {
          console.log('Waiting for WebApp initialization...');
          return false;
        }

        // Логируем информацию о WebApp
        console.log('WebApp:', WebApp);
        console.log('WebApp init data:', WebApp.initData);
        console.log('WebApp init data unsafe:', WebApp.initDataUnsafe);
        console.log('WebApp user:', WebApp.initDataUnsafe.user);
        console.log('WebApp platform:', WebApp.platform);
        console.log('WebApp version:', WebApp.version);

        // Сообщаем о готовности и разворачиваем окно
        WebApp.ready();
        WebApp.expand();
        
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
        if (typeof WebApp !== 'undefined') {
          WebApp.close();
        }
      } catch (error) {
        console.warn('Error closing Telegram WebApp:', error);
      }
    };
  }, []);

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      WebApp.HapticFeedback.impactOccurred(style)
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      switch (type) {
        case 'error':
          WebApp.HapticFeedback.notificationOccurred('error')
          break
        case 'success':
          WebApp.HapticFeedback.notificationOccurred('success')
          break
        case 'warning':
          WebApp.HapticFeedback.notificationOccurred('warning')
          break
      }
    }
  }

  const value = {
    webApp: isWebAppReady ? WebApp : null,
    user: isWebAppReady ? WebApp.initDataUnsafe.user : null,
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
