import { ReactNode, useCallback, useEffect, useState } from 'react';
import type { TelegramWebApp, WebAppUser, HapticFeedback } from '@/shared/types/telegram';
import { TelegramContext } from './context';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';
import { safeWebApp, safeTelegramCall, safeReady, safeExpand } from '../../utils/safeTelegram';

interface TelegramProviderProps {
  children: ReactNode;
}

// Увеличиваем максимальное количество попыток и время ожидания между ними
const MAX_INIT_ATTEMPTS = 3; 
const INIT_RETRY_DELAY = 800;

// Проверка на режим разработки
const IS_DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

type HapticStyle = Parameters<HapticFeedback['impactOccurred']>[0];
type NotificationType = Parameters<HapticFeedback['notificationOccurred']>[0];

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  /**
   * Проверяет доступность Telegram WebApp в более лояльном режиме
   */
  const checkWebApp = useCallback(() => {
    // В режиме разработки считаем, что WebApp всегда доступен
    if (IS_DEV_MODE) {
      console.log('💡 Dev mode: simulating Telegram WebApp');
      return true;
    }

    // Используем безопасный доступ к WebApp
    const app = safeWebApp();
    if (!app) {
      console.warn('⚠️ Telegram WebApp не найден');
      return false;
    }

    // В мобильном Telegram может не быть initData или пользователя на старте
    // Поэтому мы полагаемся на наличие самого объекта WebApp
    try {
      // Проверяем базовые методы
      if (typeof app.ready === 'function' && typeof app.expand === 'function') {
        return true;
      }
    } catch (e) {
      console.error('❌ Ошибка при проверке WebApp:', e);
    }

    return false;
  }, []);

  useEffect(() => {
    const initializeWebApp = async () => {
      try {
        console.log(`🕐 Попытка инициализации WebApp ${initAttempts + 1}/${MAX_INIT_ATTEMPTS}`);
        
        // В режиме разработки используем мок-объект
        if (IS_DEV_MODE) {
          console.log('📦 Создание мок-объекта WebApp для режима разработки');
          
          // Создаём мок-объект для разработки
          const mockUser = {
            id: 12345678,
            first_name: 'Dev',
            last_name: 'User',
            username: 'devuser',
            language_code: 'ru'
          } as WebAppUser;
          
          setUser(mockUser);
          setWebApp({} as TelegramWebApp);
          setIsInitialized(true);
          return;
        }
        
        // В продакшене проверяем наличие WebApp
        if (checkWebApp()) {
          // Безопасно получаем WebApp
          const app = safeWebApp();
          if (!app) {
            throw new Error('Не удалось получить Telegram WebApp');
          }

          // В Telegram мобильном приложении, пользователь может быть недоступен сразу
          let webAppUser = safeTelegramCall(() => app.initDataUnsafe?.user, null);
          
          // Выводим детальную информацию для отладки
          console.log('💬 WebApp факты:', {
            version: safeTelegramCall(() => app.version, 'unknown'),
            platform: safeTelegramCall(() => app.platform, 'unknown'),
            viewportHeight: safeTelegramCall(() => app.viewportHeight, 0),
            colorScheme: safeTelegramCall(() => app.colorScheme, 'unknown'),
            headerColor: safeTelegramCall(() => app.headerColor, 'unknown')
          });

          // Даже если пользователь недоступен, мы все равно продолжаем
          // Зачастую в мобильном Telegram пользователь становится доступен позже
          if (webAppUser) {
            console.log('👤 Пользователь найден:', webAppUser);
            setUser(webAppUser);
          } else {
            console.warn('⚠️ Пользователь не найден, но продолжаем инициализацию');
          }

          // Сохраняем объект WebApp для дальнейшего использования
          setWebApp(app);
          
          // Вызываем ready и expand безопасным способом
          safeReady();
          safeExpand();
          
          console.log('✅ WebApp успешно инициализирован');
          setIsInitialized(true);
          return;
        }

        // Если достигнут лимит попыток
        if (initAttempts >= MAX_INIT_ATTEMPTS) {
          // В режиме разработки просто продолжаем без WebApp
          if (IS_DEV_MODE) {
            console.log('✅ Режим разработки: продолжаем без Telegram WebApp');
            const mockUser = {
              id: 12345678,
              first_name: 'Dev',
              last_name: 'User',
              username: 'devuser',
              language_code: 'ru',
              is_premium: false
            } as WebAppUser;
            
            setUser(mockUser);
            setWebApp({} as TelegramWebApp);
            setIsInitialized(true);
            return;
          }
          
          throw new Error('Не удалось инициализировать Telegram WebApp');
        }

        // Планируем следующую попытку
        console.log(`⏳ Ожидание ${INIT_RETRY_DELAY}ms перед следующей попыткой...`);
        const timeoutId = setTimeout(() => {
          setInitAttempts(prev => prev + 1);
        }, INIT_RETRY_DELAY);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ WebApp initialization error:', error);
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
    // В режиме разработки позволяем продолжить даже при ошибке
    if (IS_DEV_MODE) {
      console.warn('⚠️ Режим разработки: продолжаем несмотря на ошибку:', initError.message);
      
      const mockUser = {
        id: 12345678,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'ru'
      } as WebAppUser;
      
      return (
        <TelegramContext.Provider
          value={{
            isReady: true,
            webApp: {} as TelegramWebApp,
            user: mockUser,
            hideBackButton: () => {},
            showBackButton: () => {},
            hideMainButton: () => {},
            showMainButton: () => {},
            haptic: undefined,
          }}
        >
          <div className="p-2 bg-yellow-100 text-yellow-800 text-xs fixed top-0 left-0 right-0 z-50">
            Режим разработки (ошибка WebApp: {initError.message})
          </div>
          {children}
        </TelegramContext.Provider>
      );
    }
    
    // В продакшене показываем экран ошибки
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="mb-4 text-xl font-bold text-gray-800">
            Не удалось запустить приложение
          </h1>
          
          <p className="text-gray-600 mb-4">{initError.message}</p>
          
          <p className="text-gray-500 text-sm mb-6">
            Пожалуйста, убедитесь, что вы открыли приложение в официальном клиенте Telegram
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Попробовать снова
            </button>
            
            <button
              onClick={() => window.location.href = 'https://t.me/taxip2p_bot'}
              className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Открыть в Telegram
            </button>
          </div>
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
