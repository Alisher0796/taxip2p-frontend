// Расширяем глобальное пространство имён
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

// Тип данных пользователя
export interface WebAppUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  language_code?: string
  is_premium?: boolean
  allows_write_to_pm?: boolean
  photo_url?: string
}

// Параметры темы
export interface ThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
}

// MainButton API
export interface MainButton {
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

// BackButton API
export interface BackButton {
  isVisible: boolean
  show: () => void
  hide: () => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
}

// Haptic API
export interface HapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  selectionChanged: () => void
}

// Основной интерфейс Telegram WebApp
export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: WebAppUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  ready: () => void
  expand: () => void
  close: () => void
  sendData: (data: string) => void
  colorScheme: 'light' | 'dark'
  themeParams: ThemeParams
  MainButton: MainButton
  BackButton: BackButton
  HapticFeedback: HapticFeedback
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  showConfirm: (message: string) => Promise<boolean>
  showAlert: (message: string) => Promise<void>
}

// Экспортируем тип, если нужно использовать как переменную где-то
declare const TelegramWebApp: TelegramWebApp
export { TelegramWebApp }

export {}
