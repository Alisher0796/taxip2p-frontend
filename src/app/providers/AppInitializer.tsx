import { ReactNode, useEffect, useState } from 'react';
import { api } from '@/shared/api/http';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';
import { ErrorScreen } from '@/shared/ui/ErrorScreen';
import { safeWebApp } from '@/app/utils/safeTelegram';

// Состояния инициализации приложения
export type InitState = 'loading' | 'error' | 'success';

interface AppInitializerProps {
  children: ReactNode;
}

// Компонент, который выполняет инициализацию приложения
export function AppInitializer({ children }: AppInitializerProps) {
  const [initState, setInitState] = useState<InitState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Инициализация при первом рендере
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing application...');
        
        // TelegramGameProxy скрипт теперь добавлен в index.html
        
        // Проверяем доступность API, получая базовые данные
        try {
          console.log('📡 Checking API connection...');
          const healthResponse = await fetch(`${import.meta.env.VITE_API_URL}/health`);
          if (healthResponse.ok) {
            console.log('✅ API connection successful');
          } else {
            console.warn('⚠️ API health check failed, but continuing');
          }
        } catch (e) {
          console.warn('⚠️ API health check failed (fetch error), but continuing', e);
        }
        
        // Проверяем Telegram WebApp
        console.log('🔍 Проверка Telegram WebApp...');
        const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
        
        // Безопасно получаем WebApp
        const webApp = safeWebApp();
        
        if (!webApp && !isDevMode) {
          throw new Error('Приложение должно быть открыто внутри Telegram');
        }
        
        if (webApp) {
          // Проверяем наличие initData для авторизации
          if (!webApp.initData && !isDevMode) {
            console.warn('⚠️ Отсутствуют данные инициализации Telegram');  
          }

          try {
            // Безопасно вызываем ready() и expand()
            if (typeof webApp.ready === 'function') {
              webApp.ready();
            }
            
            if (typeof webApp.expand === 'function') {
              webApp.expand();
            }
            
            console.log('📱 Telegram WebApp успешно инициализирован', {
              initDataLength: webApp.initData ? webApp.initData.length : 0,
              platform: webApp.platform || 'unknown',
              version: webApp.version || 'unknown',
              user: webApp.initDataUnsafe?.user ? 
                `${webApp.initDataUnsafe.user.first_name} (ID: ${webApp.initDataUnsafe.user.id})` : 
                'not available'
            });
          } catch (error) {
            console.error('❌ Ошибка при инициализации WebApp:', error);
            if (!isDevMode) {
              throw new Error('Ошибка инициализации Telegram WebApp. Попробуйте перезапустить приложение.');
            }
          }
        } else if (isDevMode) {
          console.log('🛠️ Режим разработки: продолжаем без Telegram WebApp');
        }
        
        // Предзагрузка профиля
        try {
          console.log('👤 Preloading user profile...');
          const profile = await api.getProfile();
          console.log('✅ Profile loaded successfully:', profile);
        } catch (error) {
          // В режиме разработки игнорируем ошибки профиля
          if (isDevMode) {
            console.warn('⚠️ Profile loading failed in dev mode, continuing with mock data');
          } else {
            console.error('❌ Profile loading failed:', error);
            // В production мы все равно продолжаем - RouteGuard перенаправит на выбор роли если нужно
          }
        }

        // Инициализация успешна
        console.log('🎉 Application initialized successfully');
        setInitState('success');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        setInitState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initialize();
  }, []);

  // Показываем ошибку, если инициализация не удалась
  if (initState === 'error') {
    return (
      <ErrorScreen 
        title="Ошибка инициализации"
        message={errorMessage || 'Не удалось инициализировать приложение'}
        description="Возможно, приложение запущено вне Telegram или не удается установить соединение с сервером."
        buttonText="Попробовать снова"
        onRetry={() => window.location.reload()}
        secondaryButtonText="Открыть в Telegram"
        onSecondaryAction={() => window.location.href = 'https://t.me/taxip2p_bot'}
      />
    );
  }

  // Показываем загрузку, пока приложение инициализируется
  if (initState === 'loading') {
    return <LoadingScreen />;
  }

  // Если всё успешно, показываем дочерние компоненты
  return <>{children}</>;
}
