import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button/Button';
import { useUserStore } from '@/entities/user/model/store';
import { Role } from '@/shared/types/common';
import { createHttp } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider/TelegramProvider';
import { useEffect } from 'react';

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const setRole = useUserStore((state) => state.setRole);
  const { isReady, webApp, hideBackButton, hideMainButton, haptic } = useTelegram();

  useEffect(() => {
    if (!isReady) return;

    hideBackButton();
    hideMainButton();

    const checkRole = async () => {
      try {
        const http = createHttp();
        const profile = await http<{ role?: Role }>('/profile');
        if (profile?.role) {
          setRole(profile.role);
          const nextRoute = profile.role === 'passenger' ? '/passenger' : '/driver';
          navigate(nextRoute, { replace: true });
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };

    checkRole();
  }, [isReady]);

  const handleRoleSelect = async (role: Role) => {
    if (!isReady || !webApp) {
      console.warn('WebApp not ready:', {
        isReady,
        user: webApp?.initDataUnsafe?.user,
      });
      throw new Error('Приложение доступно только через Telegram');
    }

    console.log('Selecting role:', role);
    try {
      const http = createHttp();
      const updatedProfile = await http<{ role: Role }>('/profile', {
        method: 'PUT',
        body: { role },
      });
      console.log('Profile updated:', updatedProfile);

      setRole(role);
      haptic.notification('success');

      const nextRoute = role === 'passenger' ? '/passenger' : '/driver';
      console.log('Navigating to:', nextRoute);
      navigate(nextRoute, { replace: true });
    } catch (error) {
      console.error('Error updating role:', error);

      if (error instanceof Error) {
        webApp?.showPopup?.({
          title: 'Ошибка',
          message: error.message,
          buttons: [{ type: 'ok' }],
        });
        haptic.notification('error');

        if (error.message.includes('Telegram')) {
          window.location.href = 'https://t.me/taxip2p_bot';
        }
      } else {
        alert('Произошла ошибка при выборе роли');
      }
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-4 text-xl font-bold text-gray-800">
            Приложение доступно только через Telegram
          </h1>
          <p className="text-gray-600">
            Пожалуйста, откройте это приложение через Telegram-бота
          </p>
          <Button
            onClick={() => window.location.href = 'https://t.me/taxip2p_bot'}
            className="mt-6"
          >
            Открыть в Telegram
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <h1 className="mb-4 text-xl font-bold text-gray-800">
          Выберите вашу роль
        </h1>
        <div className="flex w-full max-w-xs flex-col gap-4">
          <Button
            size="lg"
            onClick={() => handleRoleSelect('passenger')}
            className="w-full"
          >
            Я пассажир
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleRoleSelect('driver')}
            className="w-full"
          >
            Я водитель
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage;
