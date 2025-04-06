import { ReactNode, useCallback, useEffect, useState } from 'react';
import type { TelegramWebApp, WebAppUser, HapticFeedback } from '@/shared/types/telegram';
import { TelegramContext } from './context';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';

interface TelegramProviderProps {
  children: ReactNode;
}

const MAX_INIT_ATTEMPTS = 5;
const INIT_RETRY_DELAY = 500;

type HapticStyle = Parameters<HapticFeedback['impactOccurred']>[0];
type NotificationType = Parameters<HapticFeedback['notificationOccurred']>[0];

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  const checkWebApp = useCallback(() => {
    if (!window.Telegram?.WebApp) {
      return false;
    }

    const { WebApp } = window.Telegram;
    const userExists = !!WebApp.initDataUnsafe?.user;
    const initDataPresent = !!WebApp.initData;

    return userExists && initDataPresent;
  }, []);

  useEffect(() => {
    const initializeWebApp = async () => {
      try {
        if (checkWebApp()) {
          const { WebApp } = window.Telegram;
          const webAppUser = WebApp.initDataUnsafe?.user;
          
          console.debug('WebApp initialized:', {
            initData: WebApp.initData,
            user: webAppUser,
          });

          if (webAppUser) {
            setUser(webAppUser);
          }

          setWebApp(WebApp);
          WebApp.ready();
          WebApp.expand();
          setIsInitialized(true);
          return;
        }

        if (initAttempts >= MAX_INIT_ATTEMPTS) {
          throw new Error('Failed to initialize Telegram WebApp');
        }

        const timeoutId = setTimeout(() => {
          setInitAttempts(prev => prev + 1);
        }, INIT_RETRY_DELAY);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('WebApp initialization error:', error);
        setInitError(error instanceof Error ? error : new Error('Unknown error'));
      }
    };

    if (!isInitialized && !initError) {
      initializeWebApp();
    }
  }, [checkWebApp, initAttempts, isInitialized, initError]);

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  }, [webApp]);

  const showBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
    }
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  }, [webApp]);

  const showMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.show();
    }
  }, [webApp]);

  const haptic = webApp?.HapticFeedback ? {
    impact: (style: HapticStyle) => {
      try {
        webApp.HapticFeedback?.impactOccurred(style);
      } catch (error) {
        console.error('Haptic impact error:', error);
      }
    },
    notification: (type: NotificationType) => {
      try {
        webApp.HapticFeedback?.notificationOccurred(type);
      } catch (error) {
        console.error('Haptic notification error:', error);
      }
    },
    selection: () => {
      try {
        webApp.HapticFeedback?.selectionChanged();
      } catch (error) {
        console.error('Haptic selection error:', error);
      }
    },
  } : undefined;

  if (initError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-4 text-xl font-bold text-gray-800">
            Ошибка инициализации
          </h1>
          <p className="text-gray-600">{initError.message}</p>
          <button
            onClick={() => window.location.href = 'https://t.me/taxip2p_bot'}
            className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Открыть в Telegram
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <TelegramContext.Provider
      value={{
        isReady: isInitialized,
        webApp,
        user,
        hideBackButton,
        showBackButton,
        hideMainButton,
        showMainButton,
        haptic,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
