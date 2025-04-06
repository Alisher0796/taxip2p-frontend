import type { WebApp } from '@types/telegram-web-app';

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

export type WebAppUser = WebApp['WebAppUser'];
export type ThemeParams = WebApp['ThemeParams'];
export type MainButton = WebApp['MainButton'];
export type BackButton = WebApp['BackButton'];
export type HapticFeedback = WebApp['HapticFeedback'];
export type WebAppEventType = WebApp['EventType'];
export type TelegramWebApp = WebApp;

declare const TelegramWebApp: TelegramWebApp;
export { TelegramWebApp };

export {};
