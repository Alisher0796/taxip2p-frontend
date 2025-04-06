import { useEffect, useCallback } from 'react';
import { useTelegram } from '@/app/providers/TelegramProvider';
import type { ThemeParams } from '@/shared/types/telegram';

type ThemeColors = {
  background: string;
  foreground: string;
  muted: string;
  'muted-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
};

const defaultColors: ThemeColors = {
  background: '#ffffff',
  foreground: '#000000',
  muted: '#999999',
  'muted-foreground': '#999999',
  primary: '#0088cc',
  'primary-foreground': '#ffffff',
  secondary: '#f0f0f0',
  'secondary-foreground': '#000000',
};

export function useTelegramTheme() {
  const { webApp } = useTelegram();

  const applyTheme = useCallback((params: ThemeParams) => {
    const root = document.documentElement;
    const colors: ThemeColors = {
      background: params.bg_color || defaultColors.background,
      foreground: params.text_color || defaultColors.foreground,
      muted: params.hint_color || defaultColors.muted,
      'muted-foreground': params.hint_color || defaultColors['muted-foreground'],
      primary: params.button_color || defaultColors.primary,
      'primary-foreground': params.button_text_color || defaultColors['primary-foreground'],
      secondary: params.secondary_bg_color || defaultColors.secondary,
      'secondary-foreground': params.text_color || defaultColors['secondary-foreground'],
    };

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  useEffect(() => {
    if (!webApp?.themeParams) {
      console.warn('Telegram WebApp theme params are not available');
      return;
    }

    applyTheme(webApp.themeParams);

    const handler = () => {
      if (webApp.themeParams) {
        applyTheme(webApp.themeParams);
      }
    };

    webApp.onEvent('themeChanged', handler);

    return () => {
      webApp.offEvent('themeChanged', handler);
    };
  }, [webApp, applyTheme]);

  return {
    isDarkMode: webApp?.colorScheme === 'dark',
    themeParams: webApp?.themeParams,
  };
}
