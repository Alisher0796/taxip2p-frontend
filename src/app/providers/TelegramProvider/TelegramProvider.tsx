import { ReactNode, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { TelegramContext } from './context'

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
      WebApp.HapticFeedback.notificationOccurred(type)
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
