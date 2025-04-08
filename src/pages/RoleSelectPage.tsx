// Использование react-router заменено на прямую навигацию через window.location
import { Button, Spinner } from '@/shared/ui';
import { Role } from '@/shared/types/common';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider';
import { useCallback, useEffect, useRef, useState } from 'react';

// Маршруты для каждой роли
const roleRoutes: Record<Role, string> = {
  passenger: '/passenger',
  driver: '/driver',
};

const RoleSelectPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string>();
  const { isReady, webApp, hideBackButton, hideMainButton, haptic } = useTelegram();
  
  // Определяем режим разработки один раз на уровне компонента
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
  
  // Используем useRef для отслеживания состояния и предотвращения множественных операций
  const isInitialCheckDone = useRef(false);
  const navigationInProgress = useRef(false);

  // Безопасная навигация с защитой от повторных вызовов
  const navigateToRolePage = useCallback((role: Role) => {
    // Если навигация уже в процессе, ничего не делаем
    if (navigationInProgress.current) {
      console.log('ℹ️ Навигация уже выполняется');
      return;
    }
    
    const nextRoute = roleRoutes[role];
    console.log('🚩 Переход на:', nextRoute);
    
    // Блокируем дальнейшие навигации
    navigationInProgress.current = true;
    
    try {
      // Используем window.location вместо navigate для более стабильной навигации
      // Это гарантирует однократный переход и избегает проблем с history.replaceState
      window.location.pathname = nextRoute;
    } catch (error) {
      console.error('❌ Ошибка при перенаправлении:', error);
      setError('Не удалось перейти на страницу роли. Пожалуйста, обновите страницу.');
      // Разблокируем навигацию в случае ошибки
      navigationInProgress.current = false;
    }
  }, [setError]);

  // Единоразовая проверка роли при загрузке страницы
  useEffect(() => {
    // Если проверка уже выполнена или WebApp не готов, ничего не делаем
    if (!isReady || isInitialCheckDone.current) return;
    
    // Скрываем ненужные кнопки в Telegram
    hideBackButton();
    hideMainButton();
    
    // Отмечаем, что начальная проверка уже запущена
    isInitialCheckDone.current = true;
    
    const checkRole = async () => {
      try {
        console.log('🔍 Проверка роли пользователя...');
        
        const profile = await api.getProfile();
        console.log('✅ Профиль получен:', profile);

        if (profile?.role) {
          // У пользователя уже есть роль, перенаправляем
          navigateToRolePage(profile.role);
        } else {
          console.log('ℹ️ Роль не выбрана, пользователь должен выбрать роль');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Ошибка при проверке роли:', error);
        
        // В режиме разработки можно продолжить работу
        
        setError(error instanceof Error ? error.message : 'Не удалось проверить роль');
        setIsLoading(false);
      }
    };
    
    // Запускаем проверку роли (один раз)
    checkRole();
  }, [isReady, navigateToRolePage, hideBackButton, hideMainButton]);

  // Обработка выбора роли пользователем
  const handleRoleSelect = async (role: Role) => {
    // Если уже выполняется выбор или навигация, ничего не делаем
    if (isSelecting || navigationInProgress.current) {
      console.log('⚠️ Операция уже выполняется');
      return;
    }
    
    // Проверяем готовность WebApp в production режиме
    if (!isDevMode && (!isReady || !webApp)) {
      console.warn('⚠️ WebApp не готов:', { isReady, hasUser: !!webApp?.initDataUnsafe?.user });
      setError('Приложение доступно только через Telegram');
      return;
    }

    // Устанавливаем состояние выбора
    setIsSelecting(true);
    setError(undefined);
    console.log('💻 Выбрана роль:', role);

    try {
      // Сохраняем выбранную роль
      await api.updateProfile({ role });
      haptic?.notification('success');
      console.log('✅ Роль успешно сохранена');
      
      // Перенаправляем на страницу соответствующей роли
      navigateToRolePage(role);
    } catch (error) {
      console.error('❌ Ошибка при сохранении роли:', error);
      haptic?.notification('error');
      
      // В режиме разработки все равно перенаправляем
      if (isDevMode) {
        console.log('🛠️ Режим разработки: перенаправляем несмотря на ошибку');
        navigateToRolePage(role);
        return;
      }
      
      // В production показываем ошибку
      setError(error instanceof Error ? error.message : 'Не удалось сохранить роль');
      setIsSelecting(false); // Разблокируем кнопки только если не выполнили навигацию
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
