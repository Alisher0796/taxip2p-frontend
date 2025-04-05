import { createContext } from 'react'
import WebApp from '@twa-dev/sdk'

export interface TelegramContextType {
  webApp: typeof WebApp
  user: typeof WebApp.initDataUnsafe.user | null
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
  }
  isReady: boolean
  showMainButton: () => void
  hideMainButton: () => void
  showBackButton: () => void
  hideBackButton: () => void
}

export const TelegramContext = createContext<TelegramContextType | null>(null)
