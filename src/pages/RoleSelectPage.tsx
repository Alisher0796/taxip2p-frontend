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

    // Проверяем существующую роль
    const checkRole = async () => {
      try {
        const http = createHttp();
        const profile = await http<{ role?: Role }>('/profile');
        if (profile?.role) {
          setRole(profile.role);
          const nextRoute = profile.role === 'passenger' ? '/passenger' : '/driver';
          navigate(nextRoute);
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };

    checkRole();
  }, [isReady, navigate, hideBackButton, hideMainButton, setRole]);

  const handleRoleSelect = async (role: Role) => {
    console.log('Selecting role:', role);
    try {
      // Проверяем готовность WebApp
      if (!isReady || !webApp) {
        throw new Error('Приложение доступно только через Telegram');
      }

      // Создаем новый экземпляр HTTP клиента
      const http = createHttp();
      
      // Отправляем запрос на обновление профиля
      const updatedProfile = await http<{ role: Role }>('/profile', { 
        method: 'PUT', 
        body: { role }
      });
      console.log('Profile updated:', updatedProfile);
      
      console.log('Setting role in store...');
      setRole(role);
      haptic.notification('success');
    } catch (error) {
      console.error('Error updating role:', error);
      
      // Показываем ошибку пользователю
      if (error instanceof Error) {
        webApp?.showPopup({
          title: 'Ошибка',
          message: error.message,
          buttons: [{ type: 'ok' }]
        });
        haptic.notification('error');
        
        // Если ошибка связана с Telegram, перенаправляем на телеграм-бота
        if (error.message.includes('Telegram')) {
          window.location.href = 'https://t.me/taxip2p_bot';
        }
      } else {
        alert('Произошла ошибка при выборе роли');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-2xl font-bold">Выберите роль</h1>
      
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
  );
};

export default RoleSelectPage;
