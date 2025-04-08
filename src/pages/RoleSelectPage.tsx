import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Spinner } from '@/shared/ui';
import { Role } from '@/shared/types/common';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider';
import { useCallback, useEffect, useRef, useState } from 'react';

// Максимальное количество попыток проверки роли
const MAX_CHECK_RETRIES = 2;

const roleRoutes: Record<Role, string> = {
  passenger: '/passenger',
  driver: '/driver',
};

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string>();
  const { isReady, webApp, hideBackButton, hideMainButton, haptic } = useTelegram();
  
  // Используем useRef для отслеживания состояния
  const hasNavigated = useRef(false);
  const checkAttempts = useRef(0);
  const preventLoop = useRef(false);

  const navigateToRolePage = useCallback((role: Role) => {
    // Защита от повторных перенаправлений
    if (hasNavigated.current || preventLoop.current) {
      console.log('ℹ️ Перенаправление предотвращено - уже было выполнено или заблокировано');
      return;
    }
    
    const nextRoute = roleRoutes[role];
    console.log('🚩 Переход на:', nextRoute);
    
    // Предотвращаем повторное перенаправление
    hasNavigated.current = true;
    
    try {
      navigate(nextRoute, { replace: true });
    } catch (error) {
      console.error('❌ Ошибка при перенаправлении:', error);
      setError('Не удалось перейти на страницу роли. Пожалуйста, обновите страницу.');
    }
  }, [navigate, setError]);

  useEffect(() => {
    // Если уже выполнено перенаправление или предотвращаем цикл, не продолжаем
    if (!isReady || hasNavigated.current || preventLoop.current) return;
    
    // Защита от слишком большого количества попыток
    if (checkAttempts.current >= MAX_CHECK_RETRIES) {
      console.warn('⚠️ Превышено максимальное количество попыток проверки роли');
      preventLoop.current = true;
      setIsLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        // Увеличиваем счетчик попыток
        checkAttempts.current += 1;
        console.log(`🔍 Проверка роли... (Попытка ${checkAttempts.current}/${MAX_CHECK_RETRIES})`);
        
        const profile = await api.getProfile();
        console.log('✅ Профиль получен:', profile);

        if (profile?.role) {
          navigateToRolePage(profile.role);
        } else {
          console.log('ℹ️ Роль не выбрана, остаемся на странице выбора роли');
        }
      } catch (error) {
        console.error('❌ Ошибка при проверке роли:', error);
        
        // В режиме разработки предотвращаем повторные попытки
        const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
        if (isDevMode) {
          preventLoop.current = true;
        }
        
        setError(error instanceof Error ? error.message : 'Не удалось проверить роль');
      } finally {
        setIsLoading(false);
      }
    };

    // Скрываем ненужные кнопки
    hideBackButton();
    hideMainButton();
    
    // Запускаем проверку роли
    checkRole();
  }, [isReady, navigateToRolePage, hideBackButton, hideMainButton, location.pathname]);

  const handleRoleSelect = async (role: Role) => {
    // Предотвращаем повторный выбор роли
    if (isSelecting || hasNavigated.current) {
      console.warn('⚠️ Выбор роли уже выполняется или выполнено перенаправление');
      return;
    }
    
    // Предотвращаем циклические вызовы
    preventLoop.current = true;
    
    // Проверяем готовность WebApp
    if (!isReady || !webApp) {
      console.warn('⚠️ WebApp не готов:', {
        isReady,
        user: webApp?.initDataUnsafe?.user
      });
      
      // В режиме разработки мы все равно продолжаем
      const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
      if (!isDevMode) {
        setError('Приложение доступно только через Telegram');
        return;
      }
      console.log('🛠️ Режим разработки: продолжаем без WebApp');
    }

    setIsSelecting(true);
    setError(undefined);
    console.log('💻 Выбрана роль:', role);

    try {
      await api.updateProfile({ role });
      haptic?.notification('success');
      console.log('✅ Роль успешно сохранена');
      
      // Добавляем небольшую задержку перед перенаправлением,
      // чтобы избежать слишком быстрых перенаправлений
      setTimeout(() => navigateToRolePage(role), 100);
    } catch (error) {
      console.error('❌ Ошибка при сохранении роли:', error);
      haptic?.notification('error');
      
      // В режиме разработки все равно перенаправляем
      const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
      if (isDevMode) {
        console.log('🛠️ Режим разработки: перенаправляем несмотря на ошибку');
        setTimeout(() => navigateToRolePage(role), 300);
        return;
      }
      
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
