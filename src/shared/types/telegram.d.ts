declare global {
  interface Window {
    Telegram?: Partial<{
      WebApp: Partial<WebApp>
    }>
  }
}

export interface WebAppUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  language_code?: string
  is_premium?: boolean
}

export interface ThemeParams {
  bg_color: string
  text_color: string
  hint_color: string
  link_color: string
  button_color: string
  button_text_color: string
}

export interface WebApp {
  initDataUnsafe: {
    user?: WebAppUser
  }
  ready: () => void
  expand: () => void
  close: () => void
  colorScheme: 'light' | 'dark'
  themeParams: Partial<ThemeParams>
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  showConfirm: (message: string) => Promise<boolean>
  showAlert: (message: string) => Promise<void>
}

// Экспортируем тип для использования в других файлах
declare const TelegramWebApp: WebApp
export { TelegramWebApp }

export {}
