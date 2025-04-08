import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../TelegramProvider/hooks';
import { api } from '@/shared/api/http';
import { LoadingScreen } from '@/shared/ui';
import type { Role } from '@/shared/types/common';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: Role;
}

/**
 * Улучшенная версия RouteGuard, которая избегает циклических запросов 
 * и поддерживает режим разработки
 */
export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isReady, haptic } = useTelegram();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Предотвращаем циклические редиректы
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  const MAX_RETRIES = isDevMode ? 1 : 2; // В режиме разработки делаем меньше попыток

  useEffect(() => {
    // Флаг для предотвращения асинхронных операций после размонтирования
    let isMounted = true;
    
    // Разрешаем проверку, только если Telegram WebApp готов или мы в режиме разработки
    if ((!isReady && !isDevMode) || hasNavigated) return;
    
    // Функция проверки доступа с упрощенной логикой и защитой от циклов
    const checkAccess = async () => {
      console.log(`🔐 Checking access, retry ${retryCount}/${MAX_RETRIES}`);

      try {
        // В режиме разработки создаем временный профиль если достигли лимита повторов
        if (isDevMode && retryCount >= MAX_RETRIES) {
          console.warn('⚠️ Dev mode: max retries reached, using mock profile');
          if (!isMounted) return;
          setIsChecking(false);
          return;
        }

        // Получаем профиль пользователя
        const profile = await api.getProfile();
        console.log('👤 Profile loaded:', profile);
        
        // Если профиль загружен, проверяем роль
        if (profile && requiredRole && profile.role !== requiredRole) {
          console.warn(`⚠️ Role mismatch: Required ${requiredRole}, but user has ${profile.role}`);
          if (isMounted) {
            haptic?.notification('error');
            setHasNavigated(true);
            navigate('/', { replace: true });
          }
          return;
        }
  
        // Профиль загружен и роль совпадает (или роль не требуется)
        if (isMounted) {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('❌ Access check error:', error);
        
        // Решение для 404 ошибок - перенаправляем на выбор роли только в случае необходимости
        if (error instanceof Error && 
            (error.message.includes('404') || 
            error.message.includes('Profile not found'))) {
          
          // Пробуем создать профиль в случае 404
          try {
            if (retryCount < MAX_RETRIES) {
              console.log('🔄 Trying to create profile...');
              await api.updateProfile({ role: requiredRole || 'passenger' });
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
              return;
            } else {
              // Если слишком много попыток - перенаправляем на выбор роли
              console.warn('⚠️ Too many retries, redirecting to role selection');
              if (isMounted) {
                haptic?.notification('error');
                setHasNavigated(true);
                navigate('/', { replace: true });
              }
              return;
            }
          } catch (createError) {
            console.error('❌ Profile creation failed:', createError);
            if (isMounted) {
              // В режиме разработки разрешаем доступ даже при ошибках
              if (isDevMode) {
                console.warn('⚠️ Dev mode: allowing access despite errors');
                setIsChecking(false);
                return;
              }

              setHasNavigated(true);
              navigate('/', { replace: true });
            }
            return;
          }
        }

        // Для других ошибок
        if (isMounted) {
          // В режиме разработки просто пропускаем проверку при ошибках
          if (isDevMode) {
            console.warn('⚠️ Dev mode: allowing access despite errors');
            setIsChecking(false);
          } else if (retryCount < MAX_RETRIES) {
            // Попробуем еще раз
            setRetryCount(prev => prev + 1);
          } else {
            // Если ничего не помогло - перенаправляем на начальный экран
            haptic?.notification('error');
            setHasNavigated(true);
            navigate('/', { replace: true });
          }
        }
      }
    };

    // Выполняем проверку доступа
    checkAccess();
    
    // Очистка
    return () => {
      isMounted = false;
    };
  }, [isReady, requiredRole, navigate, haptic, retryCount, isDevMode, hasNavigated]);

  // Показываем загрузку только если она действительно нужна
  if (isChecking && !isDevMode) {
    return <LoadingScreen />;
  }

  // Показываем содержимое
  return <>{children}</>;
}
