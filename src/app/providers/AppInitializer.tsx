import { ReactNode, useEffect, useState } from 'react';
import { api } from '@/shared/api/http';
import { LoadingScreen } from '@/shared/ui';
import { ErrorScreen } from '@/shared/ui/ErrorScreen';

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
        console.log('🔍 Checking for Telegram WebApp...');
        const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
        
        if (!window.Telegram?.WebApp && !isDevMode) {
          throw new Error('Telegram WebApp not available. Please open this app inside Telegram.');
        }
        
        if (window.Telegram?.WebApp) {
          // Инициализация Telegram WebApp
          const { WebApp } = window.Telegram;
          WebApp.ready();
          WebApp.expand();
          
          console.log('📱 Telegram WebApp initialized', {
            initData: WebApp.initData?.slice(0, 20) + '...',
            user: WebApp.initDataUnsafe?.user
          });
        } else if (isDevMode) {
          console.log('🛠️ Dev mode active, continuing without Telegram WebApp');
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
    return <ErrorScreen message={errorMessage || 'Application initialization failed'} />;
  }

  // Показываем загрузку, пока приложение инициализируется
  if (initState === 'loading') {
    return <LoadingScreen />;
  }

  // Если всё успешно, показываем дочерние компоненты
  return <>{children}</>;
}
