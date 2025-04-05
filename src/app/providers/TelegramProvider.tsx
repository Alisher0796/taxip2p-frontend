import { createContext, useEffect, useState, type ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

type EventNames = 'viewportChanged' | 'themeChanged' | 'mainButtonClicked' | 'backButtonClicked' | 'settingsButtonClicked';

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

interface TelegramContextType {
  webApp: typeof WebApp;
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
  sendData: (data: unknown) => void;
  close: () => void;
  expand: () => void;
  onEvent: (eventType: EventNames, callback: () => void) => void;
  offEvent: (eventType: EventNames, callback: () => void) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null)

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<WebAppUser | null>(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user);
      setIsReady(true);
    } else {
      console.warn('Telegram user not found in initDataUnsafe');
    }
  }, []);

  const haptic = {
    impact: (style: HapticStyle) => WebApp.HapticFeedback.impactOccurred(style),
    notification: (type: HapticNotificationType) => WebApp.HapticFeedback.notificationOccurred(type),
    selectionChanged: () => WebApp.HapticFeedback.selectionChanged()
  };

  const mainButton = {
    show: (text: string, onClick: () => void) => {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    },
    hide: () => WebApp.MainButton.hide(),
    enable: () => WebApp.MainButton.enable(),
    disable: () => WebApp.MainButton.disable(),
    showProgress: (leaveActive?: boolean) => WebApp.MainButton.showProgress(leaveActive),
    hideProgress: () => WebApp.MainButton.hideProgress(),
    setParams: (params: MainButtonParams) => WebApp.MainButton.setParams(params)
  };

  const backButton = {
    show: (onClick: () => void) => {
      WebApp.BackButton.onClick(onClick);
      WebApp.BackButton.show();
    },
    hide: () => WebApp.BackButton.hide(),
    isVisible: WebApp.BackButton.isVisible
  };

  const settingsButton = {
    show: (onClick: () => void) => {
      WebApp.SettingsButton.onClick(onClick);
      WebApp.SettingsButton.show();
    },
    hide: () => WebApp.SettingsButton.hide(),
    isVisible: WebApp.SettingsButton.isVisible
  };

  const theme = {
    colorScheme: WebApp.colorScheme || 'light',
    params: WebApp.themeParams || {
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
    height: WebApp.viewportHeight || window.innerHeight,
    stableHeight: WebApp.viewportStableHeight || window.innerHeight,
    isExpanded: WebApp.isExpanded || false
  };

  return (
    <TelegramContext.Provider 
      value={{ 
        webApp: WebApp, 
        user, 
        isReady,
        viewport,
        haptic,
        mainButton,
        backButton,
        settingsButton,
        theme,
        sendData: (data: unknown) => WebApp.sendData(data),
        close: () => WebApp.close(),
        expand: () => WebApp.expand(),
        onEvent: (eventType: EventNames, callback: () => void) => WebApp.onEvent(eventType, callback),
        offEvent: (eventType: EventNames, callback: () => void) => WebApp.offEvent(eventType, callback)
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}


