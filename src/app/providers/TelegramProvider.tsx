import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import crypto from 'crypto';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotificationType = 'error' | 'success' | 'warning';
type ColorScheme = 'light' | 'dark';

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface WebAppInitDataUnsafe {
  query_id?: string;
  user: WebAppUser;
  auth_date: number;
  hash: string;
  start_param?: string;
}

interface ThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
}

interface MainButtonParams {
  text: string;
  color?: string;
  text_color?: string;
  is_active?: boolean;
  is_visible?: boolean;
}

interface ViewportState {
  height: number;
  stableHeight: number;
  isExpanded: boolean;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: WebAppInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: ColorScheme;
  themeParams: ThemeParams;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: any) => void;
  HapticFeedback: {
    impactOccurred: (style: HapticStyle) => void;
    notificationOccurred: (type: HapticNotificationType) => void;
    selectionChanged: () => void;
  };
  MainButton: {
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setParams: (params: MainButtonParams) => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    isVisible: boolean;
  };
  SettingsButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    isVisible: boolean;
  };
}

// Получаем доступ к глобальному объекту Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: WebAppUser | null;
  isReady: boolean;
  viewport: ViewportState;
  haptic: {
    impact: (style: HapticStyle) => void;
    notification: (type: HapticNotificationType) => void;
    selectionChanged: () => void;
  };
  mainButton: {
    show: (text: string, onClick: () => void) => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: MainButtonParams) => void;
  };
  backButton: {
    show: (onClick: () => void) => void;
    hide: () => void;
    isVisible: boolean;
  };
  settingsButton: {
    show: (onClick: () => void) => void;
    hide: () => void;
    isVisible: boolean;
  };
  theme: {
    colorScheme: ColorScheme;
    params: ThemeParams;
  };
  sendData: (data: any) => void;
  close: () => void;
  expand: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null)

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isWebAppReady, setIsWebAppReady] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const maxAttempts = 50; // 5 секунд с интервалом 100мс

  // Проверяем валидность initData
  const validateInitData = useCallback((webApp: TelegramWebApp): boolean => {
    try {
      if (!webApp.initData || !webApp.initDataUnsafe?.user) {
        console.warn('Missing initData or user');
        return false;
      }

      const { hash, auth_date, user, ...data } = webApp.initDataUnsafe;

      // Проверяем, что user содержит необходимые поля
      if (!user.id || !user.first_name) {
        console.warn('Invalid user data in initDataUnsafe');
        return false;
      }

      // Проверяем auth_date
      if (!auth_date) {
        console.warn('Missing auth_date in initDataUnsafe');
        return false;
      }

      // Проверяем, что auth_date не старше 24 часов
      const now = Math.floor(Date.now() / 1000);
      if (now - auth_date > 86400) {
        console.warn('Auth date is too old');
        return false;
      }

      // Проверяем hash
      const BOT_TOKEN = process.env.NEXT_PUBLIC_BOT_TOKEN;
      if (!BOT_TOKEN) {
        console.error('Bot token not found in environment variables');
        return false;
      }

      // Сортируем поля в алфавитном порядке
      const checkString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key as keyof typeof data]}`)
        .join('\n');

      // Создаем HMAC-SHA256
      const secret = crypto
        .createHmac('sha256', 'WebAppData')
        .update(BOT_TOKEN)
        .digest();

      const signature = crypto
        .createHmac('sha256', secret)
        .update(checkString)
        .digest('hex');

      if (signature !== hash) {
        console.warn('Invalid hash');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating initData:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initWebApp = () => {
      try {
        if (!window.Telegram?.WebApp) {
          if (initAttempts < maxAttempts) {
            console.warn('Telegram WebApp SDK not available, retrying...');
            setInitAttempts(prev => prev + 1);
            return false;
          } else {
            console.error('Failed to initialize Telegram WebApp after multiple attempts');
            return false;
          }
        }

        const app = window.Telegram.WebApp;

        // Проверяем текущее состояние
        console.log('Checking WebApp state:', {
          version: app.version,
          platform: app.platform,
          initData: app.initData,
          initDataUnsafe: app.initDataUnsafe
        });

        // Валидируем initData
        if (!validateInitData(app)) {
          if (initAttempts < maxAttempts) {
            setInitAttempts(prev => prev + 1);
            return false;
          }
          return false;
        }

        // Настраиваем обработчики событий
        app.onEvent('viewportChanged', () => {
          app.expand();
        });

        app.onEvent('popupClosed', () => {
          console.log('Popup closed');
        });

        // Инициализируем WebApp
        console.log('WebApp initialized successfully');
        setWebApp(app);
        setUser(app.initDataUnsafe.user);
        setIsWebAppReady(true);
        app.ready();
        app.expand();
        return true;

      } catch (error) {
        console.error('Error initializing WebApp:', error);
        return false;
      }
    };

    // Если WebApp еще не инициализирован и не превышено количество попыток,
    // пробуем инициализировать его каждые 100мс
    if (!isWebAppReady && initAttempts < maxAttempts) {
      const timeoutId = setTimeout(initWebApp, 100);
      return () => clearTimeout(timeoutId);
    }

    return () => {
      try {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
      } catch (error) {
        console.warn('Error closing WebApp:', error);
      }
    };
  }, [isWebAppReady, initAttempts, validateInitData, maxAttempts]);

  const haptic = {
    impact: (style: HapticStyle) => {
      if (webApp) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: HapticNotificationType) => {
      if (webApp) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    },
    selectionChanged: () => {
      if (webApp) {
        webApp.HapticFeedback.selectionChanged();
      }
    }
  };

  const mainButton = {
    show: (text: string, onClick: () => void) => {
      if (webApp) {
        webApp.MainButton.setText(text);
        webApp.MainButton.onClick(onClick);
        webApp.MainButton.show();
      }
    },
    hide: () => {
      if (webApp) {
        webApp.MainButton.hide();
      }
    },
    enable: () => {
      if (webApp) {
        webApp.MainButton.enable();
      }
    },
    disable: () => {
      if (webApp) {
        webApp.MainButton.disable();
      }
    },
    showProgress: (leaveActive?: boolean) => {
      if (webApp) {
        webApp.MainButton.showProgress(leaveActive);
      }
    },
    hideProgress: () => {
      if (webApp) {
        webApp.MainButton.hideProgress();
      }
    },
    setParams: (params: MainButtonParams) => {
      if (webApp) {
        webApp.MainButton.setParams(params);
      }
    }
  };

  const backButton = {
    show: (onClick: () => void) => {
      if (webApp) {
        webApp.BackButton.onClick(onClick);
        webApp.BackButton.show();
      }
    },
    hide: () => {
      if (webApp) {
        webApp.BackButton.hide();
      }
    },
    isVisible: webApp?.BackButton.isVisible || false
  };

  const settingsButton = {
    show: (onClick: () => void) => {
      if (webApp) {
        webApp.SettingsButton.onClick(onClick);
        webApp.SettingsButton.show();
      }
    },
    hide: () => {
      if (webApp) {
        webApp.SettingsButton.hide();
      }
    },
    isVisible: webApp?.SettingsButton.isVisible || false
  };

  const theme = {
    colorScheme: webApp?.colorScheme || 'light',
    params: webApp?.themeParams || {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#2481cc',
      button_color: '#2481cc',
      button_text_color: '#ffffff',
      secondary_bg_color: '#f0f0f0'
    }
  };

  const viewport = {
    height: webApp?.viewportHeight || window.innerHeight,
    stableHeight: webApp?.viewportStableHeight || window.innerHeight,
    isExpanded: webApp?.isExpanded || false
  };

  return (
    <TelegramContext.Provider 
      value={{ 
        webApp, 
        user, 
        isReady: isWebAppReady,
        viewport,
        haptic,
        mainButton,
        backButton,
        settingsButton,
        theme,
        sendData: (data: any) => webApp?.sendData(data),
        close: () => webApp?.close(),
        expand: () => webApp?.expand(),
        onEvent: (eventType: string, callback: () => void) => webApp?.onEvent(eventType, callback),
        offEvent: (eventType: string, callback: () => void) => webApp?.offEvent(eventType, callback)
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}
