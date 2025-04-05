import { ReactNode, useContext, useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { TelegramContext } from './context'

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}

export interface TelegramProviderProps {
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

  const showMainButton = () => {
    WebApp.MainButton.show()
  }

  const hideMainButton = () => {
    WebApp.MainButton.hide()
  }

  const value = {
    webApp: WebApp,
    user: WebApp.initDataUnsafe.user,
    haptic,
    isReady,
    showMainButton,
    hideMainButton
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}
