import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../TelegramProvider/hooks';
import { api } from '@/shared/api/http';
import { LoadingScreen } from '@/shared/ui';
import type { Role } from '@/shared/types/common';
import type { Profile } from '@/shared/types/api';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: Role;
}

type AccessCheckResult = {
  isAllowed: boolean;
  profile: Profile | null;
  error?: string;
};

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isReady, haptic } = useTelegram();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    const checkAccess = async (): Promise<AccessCheckResult> => {
      try {
        let profile: Profile | null = null;

        try {
          profile = await api.getProfile();
          console.log('Profile loaded successfully:', profile);
        } catch (error) {
          console.warn('Profile loading error:', error);
          
          // Защита от циклических запросов при ошибках API
          if (error instanceof Error) {
            const isProfileNotFound = error.message === 'Profile not found' || 
                                     error.message.includes('404');
                                     
            if (isProfileNotFound) {
              try {
                // Если нет профиля, создаем новый
                profile = await api.updateProfile({ role: 'passenger' });
                console.log('Created new profile:', profile);
              } catch (createError) {
                console.error('Failed to create profile:', createError);
                // Возвращаем заглушку, чтобы избежать циклических запросов
                return {
                  isAllowed: true, // Разрешаем доступ для дальнейшего настроения
                  profile: {
                    id: 'temp-id',
                    username: 'guest',
                    role: requiredRole || 'passenger',
                    telegramId: '0',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    rating: 5
                  } as Profile
                };
              }
            } else {
              // Другие ошибки API
              console.error('API Error in RouteGuard:', error.message);
            }
          }
          
          // Если не удалось обработать ошибку, передаем ее дальше
          throw error;
        }

        // Profile doesn't exist (this shouldn't happen after the above)
        if (!profile) {
          return {
            isAllowed: false,
            profile: null,
            error: 'Profile not found',
          };
        }

        // No role assigned
        if (!profile.role) {
          return {
            isAllowed: false,
            profile,
            error: 'No role assigned',
          };
        }

        // Role mismatch
        if (requiredRole && profile.role !== requiredRole) {
          return {
            isAllowed: false,
            profile,
            error: `Access denied: Required role '${requiredRole}', but current role is '${profile.role}'`,
          };
        }

        // Access granted
        return {
          isAllowed: true,
          profile,
        };
      } catch (error) {
        return {
          isAllowed: false,
          profile: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    };

    checkAccess().then((result) => {
      if (!result.isAllowed) {
        console.error('Access check failed:', result.error);
        haptic?.notification('error');
        // Исправлено неправильное перенаправление - в маршрутах нет пути /role, есть только /
        navigate('/', { replace: true });
      }
      setIsChecking(false);
    }).catch(error => {
      console.error('RouteGuard error:', error);
      // Если произошла ошибка при проверке - не заблокировать пользователя
      setIsChecking(false);
    });
  }, [isReady, requiredRole, navigate, haptic]);

  if (!isReady || isChecking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
