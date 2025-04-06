import { useContext } from 'react';
import { TelegramContext } from '@/app/providers/TelegramProvider/context';

/** Хук для доступа к Telegram WebApp */
export function useTelegram() {
  const context = useContext(TelegramContext);

  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }

  return context;
}
