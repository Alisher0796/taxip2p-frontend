import type { TelegramWebApp, WebAppUser } from '@/shared/types/telegram';

export interface HapticFeedback {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notification: (type: 'error' | 'success' | 'warning') => void;
  selection: () => void;
}

/** Контекст Telegram WebApp */
export interface TelegramContextType {
  /** Инстанс WebApp */
  webApp: TelegramWebApp | null;
  /** Информация о пользователе */
  user: WebAppUser | null;
  /** Статус инициализации */
  isReady: boolean;
  /** Тактильная обратная связь */
  haptic: HapticFeedback | undefined;
  /** Показать главную кнопку */
  showMainButton: () => void;
  /** Скрыть главную кнопку */
  hideMainButton: () => void;
  /** Показать кнопку назад */
  showBackButton: () => void;
  /** Скрыть кнопку назад */
  hideBackButton: () => void;
}

export type { WebAppUser };
