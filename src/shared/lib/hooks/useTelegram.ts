import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Инициализация WebApp
    WebApp.ready();

    // Настройка темы в соответствии с Telegram
    const isDark = WebApp.colorScheme === 'dark';
    
    WebApp.setHeaderColor(isDark ? '#1F2937' : '#ffffff');
    WebApp.setBackgroundColor(isDark ? '#111827' : '#ffffff');
    
    // Скрываем главную кнопку при инициализации
    WebApp.MainButton.hide();

    // Получаем данные пользователя
    if (WebApp.initDataUnsafe?.user) {
      setUser({
        id: WebApp.initDataUnsafe.user.id,
        username: WebApp.initDataUnsafe.user.username,
        firstName: WebApp.initDataUnsafe.user.first_name,
        lastName: WebApp.initDataUnsafe.user.last_name,
      });
    }

    setIsReady(true);

    return () => {
      // Очистка при размонтировании
      WebApp.MainButton.hide();
      WebApp.MainButton.offClick(() => {});
    };
  }, []);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    WebApp.MainButton.setText(text);
    // Сначала удаляем предыдущий обработчик
    WebApp.MainButton.offClick(() => {});
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
  }, []);

  const hideMainButton = useCallback(() => {
    WebApp.MainButton.offClick(() => {});
    WebApp.MainButton.hide();
  }, []);

  const showBackButton = useCallback((onClick: () => void) => {
    WebApp.BackButton.onClick(onClick);
    WebApp.BackButton.show();
  }, []);

  const hideBackButton = useCallback(() => {
    WebApp.BackButton.offClick(() => {});
    WebApp.BackButton.hide();
  }, []);

  const showAlert = useCallback((message: string) => {
    WebApp.showAlert(message);
  }, []);

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      WebApp.showConfirm(message, (confirmed: boolean) => {
        resolve(confirmed);
      });
    });
  }, []);

  return {
    isReady,
    user,
    isDarkMode: WebApp.colorScheme === 'dark',
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    webApp: WebApp,
  };
};
