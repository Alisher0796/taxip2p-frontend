import { ReactNode, useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { TelegramContext } from './context'

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isReady) {
      // Инициализация Telegram WebApp
      WebApp.ready()
      WebApp.expand()
      setIsReady(true)
    }

    // Очистка при размонтировании
    return () => {
      WebApp.close()
    }
  }, [isReady])

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
    haptic,
    isReady
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}
