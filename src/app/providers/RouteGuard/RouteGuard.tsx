import { ReactNode, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { api } from '@/shared/api/http';
import { ErrorScreen } from '@/shared/ui/ErrorScreen';
import { safeWebApp } from '@/app/utils/safeTelegram';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';
import type { Profile } from '@/shared/types/api';

const AUTH_RETRY_DELAY = 2000; // 2 секунды между попытками
const MAX_AUTH_RETRIES = 3; // Максимальное количество попыток

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: 'passenger' | 'driver';
}

/**
 * Улучшенная версия RouteGuard, которая избегает циклических запросов, 
 * поддерживает режим разработки и обеспечивает восстановление при проблемах авторизации
 */
export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isReady } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Используем useRef для отслеживания попыток авторизации
  const authRetryTimeoutRef = useRef<number | null>(null);

  // Определяем режим разработки
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

  // Функция для проверки и исправления проблем авторизации
  const checkTelegramAuthStatus = () => {
    const webApp = safeWebApp();
    
    if (!webApp) {
      console.warn('⚠️ WebApp не доступен, попытка обновления...');
      return false;
    }
    
    const initData = webApp.initData;
    
    if (!initData || initData.length < 10) {
      console.warn('⚠️ Отсутствуют данные инициализации Telegram:', { 
        initDataLength: initData?.length || 0 
      });
      return false;
    }
    
    return true;
  };
  
  // Обработчик ошибок авторизации
  const handleAuthError = (err: any) => {
    console.error('🔐 Ошибка авторизации:', err);
    
    // Проверяем, связана ли ошибка с авторизацией Telegram
    const isAuthError = 
      err?.message?.toLowerCase().includes('авторизац') ||
      err?.message?.toLowerCase().includes('telegram') ||
      err?.message?.toLowerCase().includes('init data');
      
    if (isAuthError && retryCount < MAX_AUTH_RETRIES) {
      console.log(`🔄 Попытка восстановления авторизации ${retryCount + 1}/${MAX_AUTH_RETRIES}...`);
      
      // Увеличиваем счетчик попыток
      setRetryCount(prev => prev + 1);
      
      // Проверяем статус авторизации Telegram
      const isValidAuth = checkTelegramAuthStatus();
      
      if (!isValidAuth) {
        console.warn('🔄 Данные инициализации невалидны, планируем перезагрузку...');
        
        // Очищаем предыдущий таймаут, если он был
        if (authRetryTimeoutRef.current) {
          window.clearTimeout(authRetryTimeoutRef.current);
        }
        
        // Планируем перезагрузку страницы
        authRetryTimeoutRef.current = window.setTimeout(() => {
          console.log('🔄 Перезагрузка страницы для восстановления авторизации...');
          window.location.reload();
        }, AUTH_RETRY_DELAY);
        
        return;
      }
      
      // Если авторизация в порядке, повторяем загрузку профиля
      setTimeout(checkAccess, AUTH_RETRY_DELAY);
      return;
    }
    
    // Если это не ошибка авторизации или исчерпаны попытки, показываем ошибку
    setError(err instanceof Error ? err : new Error('Ошибка загрузки профиля'));
    setIsLoading(false);
  };

  const checkAccess = async () => {
    try {
      if (!isReady) {
        console.debug('Telegram not ready yet, waiting...');
        return; // Еще не готово, ждем
      }

      // В режиме разработки можем использовать мок-данные
      if (isDevMode && retryCount >= MAX_AUTH_RETRIES) {
        console.log('🛠️ Режим разработки: продолжаем без авторизации...');
        setIsLoading(false);
        return;
      }

      const userResponse = await api.getProfile() as Profile;
      console.debug('✅ User profile loaded:', userResponse);

      // Сбрасываем счетчик попыток, если запрос успешен
      if (retryCount > 0) {
        setRetryCount(0);
      }

      // Проверяем роль пользователя, если требуется
      if (requiredRole && userResponse.role !== requiredRole) {
        console.warn(`⚠️ Требуемая роль: ${requiredRole}, роль пользователя: ${userResponse.role}`);
        navigate('/');
        return;
      }

      if (!userResponse.role) {
        // Пользователь новый, отправляем на страницу выбора роли
        if (location.pathname !== '/welcome') {
          navigate('/welcome');
        }
      } else {
        // Пользователь с ролью, проверяем корректность маршрута
        if (location.pathname === '/welcome') {
          navigate('/');
        }
      }

      setIsLoading(false);
    } catch (err) {
      handleAuthError(err);
    }
  };

  // Запускаем проверку при изменении состояния готовности
  useEffect(() => {
    if (isReady) {
      checkAccess();
    }
    
    // Очищаем таймауты при размонтировании
    return () => {
      if (authRetryTimeoutRef.current) {
        window.clearTimeout(authRetryTimeoutRef.current);
      }
    };
  }, [isReady, location.pathname, requiredRole]);

  // Отображаем экран ошибки
  if (error) {
    return (
      <ErrorScreen
        title="Ошибка авторизации"
        message={error.message}
        description="Проблема может быть связана с данными авторизации Telegram."
        buttonText="Попробовать снова"
        onRetry={() => {
          // Сбрасываем счетчик попыток и ошибку
          setRetryCount(0);
          setError(null);
          setIsLoading(true);
          
          // Проверяем статус авторизации перед повторной попыткой
          const isValidAuth = checkTelegramAuthStatus();
          
          if (!isValidAuth) {
            console.log('🔄 Перезагрузка страницы для восстановления авторизации...');
            window.location.reload();
            return;
          }
          
          checkAccess();
        }}
        secondaryButtonText="Перезагрузить страницу"
        onSecondaryAction={() => {
          window.location.reload();
        }}
      />
    );
  }

  // Отображаем экран загрузки
  if (isLoading && !isDevMode) {
    return <LoadingScreen />;
  }

  // Отображаем содержимое
  return <>{children}</>;
}
