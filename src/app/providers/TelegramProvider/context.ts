import { createContext } from 'react'
import WebApp from '@twa-dev/sdk'

export interface TelegramContextType {
  webApp: typeof WebApp | null
  user: typeof WebApp.initDataUnsafe.user | null
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
  }
  isReady: boolean
}

export const TelegramContext = createContext<TelegramContextType | null>(null)
