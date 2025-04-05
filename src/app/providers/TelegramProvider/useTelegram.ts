import { useContext } from 'react'
import type { TelegramContextType } from '@/app/providers/TelegramProvider/context'
import { TelegramContext } from '@/app/providers/TelegramProvider/context'
import WebApp from '@twa-dev/sdk'

// Fallback значения для случаев, когда контекст недоступен
const fallbackContext: TelegramContextType = {
  webApp: null,
  user: null,
  haptic: {
    impact: () => {},
    notification: () => {}
  }
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    // В режиме разработки возвращаем фейковый контекст
    if (import.meta.env.DEV) {
      console.warn('useTelegram: контекст не найден, используются fallback значения')
      return fallbackContext
    }
    // В production пытаемся использовать глобальный WebApp
    try {
      return {
        webApp: WebApp,
        user: WebApp.initDataUnsafe.user,
        haptic: {
          impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
            WebApp.HapticFeedback.impactOccurred(style)
          },
          notification: (type: 'error' | 'success' | 'warning') => {
            WebApp.HapticFeedback.notificationOccurred(type)
          }
        }
      }
    } catch (e) {
      console.warn('useTelegram: WebApp не инициализирован, используются fallback значения')
      return fallbackContext
    }
  }
  return context
}
