import { createContext, useContext, useEffect, type ReactNode } from 'react'
import WebApp from '@twa-dev/sdk'

interface TelegramContextType {
  webApp: typeof WebApp | null
  user: typeof WebApp['initDataUnsafe']['user'] | null
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
  }
}

const TelegramContext = createContext<TelegramContextType | null>(null)

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  useEffect(() => {
    // Инициализация Telegram WebApp
    WebApp.ready()
    WebApp.expand()

    // Очистка при размонтировании
    return () => {
      WebApp.close()
    }
  }, [])

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      WebApp.HapticFeedback.impactOccurred(style)
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      switch (type) {
        case 'error':
          WebApp.HapticFeedback.notificationOccurred('error')
          break
        case 'success':
          WebApp.HapticFeedback.notificationOccurred('success')
          break
        case 'warning':
          WebApp.HapticFeedback.notificationOccurred('warning')
          break
      }
    }
  }

  const value = {
    webApp: WebApp,
    user: WebApp.initDataUnsafe.user,
    haptic
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}
