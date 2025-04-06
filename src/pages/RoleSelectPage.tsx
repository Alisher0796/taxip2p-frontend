import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from '@/shared/ui';
import { Role } from '@/shared/types/common';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider';
import { useCallback, useEffect, useRef, useState } from 'react';

const roleRoutes: Record<Role, string> = {
  passenger: '/passenger',
  driver: '/driver',
};

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string>();
  const { isReady, webApp, hideBackButton, hideMainButton, haptic } = useTelegram();
  const hasNavigated = useRef(false);

  const navigateToRolePage = useCallback((role: Role) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    const nextRoute = roleRoutes[role];
    console.log('Navigating to:', nextRoute);
    navigate(nextRoute, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!isReady || hasNavigated.current) return;

    const checkRole = async () => {
      try {
        console.log('Checking role...');
        const profile = await api.getProfile();
        console.log('Profile response:', profile);

        if (profile?.role) {
          navigateToRolePage(profile.role);
        }
      } catch (error) {
        console.error('Error checking role:', error);
        setError(error instanceof Error ? error.message : 'Не удалось проверить роль');
      } finally {
        setIsLoading(false);
      }
    };

    hideBackButton();
    hideMainButton();
    checkRole();
  }, [isReady, navigateToRolePage, hideBackButton, hideMainButton]);

  const handleRoleSelect = async (role: Role) => {
    if (!isReady || !webApp) {
      console.warn('WebApp not ready:', {
        isReady,
        user: webApp?.initDataUnsafe?.user
      });
      setError('Приложение доступно только через Telegram');
      return;
    }

    setIsSelecting(true);
    setError(undefined);
    console.log('Selecting role:', role);

    try {
      await api.updateProfile({ role });
      haptic?.notification('success');
      navigateToRolePage(role);
    } catch (error) {
      console.error('Error setting role:', error);
      haptic?.notification('error');
      setError(error instanceof Error ? error.message : 'Не удалось сохранить роль');
    } finally {
      setIsSelecting(false);
    }
  };

  const isButtonDisabled = !isReady || isLoading || isSelecting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        {!isReady && (
          <Button
            onClick={() => (window.location.href = 'https://t.me/taxip2p_bot')}
            className="mt-6"
          >
            Открыть в Telegram
          </Button>
        )}
        
        <h1 className="mb-4 text-xl font-bold text-gray-800">
          Выберите вашу роль
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-xs flex-col gap-4">

          <Button
            size="lg"
            onClick={() => handleRoleSelect('passenger')}
            className="w-full"
            disabled={isButtonDisabled}
            isLoading={isSelecting}
          >
            Я пассажир
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleRoleSelect('driver')}
            className="w-full"
            disabled={isButtonDisabled}
            isLoading={isSelecting}
          >
            Я водитель
          </Button>
        </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectPage;
