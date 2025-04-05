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
    try {
      if (!isReady) {
        // Проверяем, что приложение запущено в Telegram
        if (!WebApp.initData) {
          console.warn('WebApp initData is empty. Make sure the app is running inside Telegram.')
        }

        // Инициализация Telegram WebApp
        WebApp.ready()
        WebApp.expand()
        setIsReady(true)
      }
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error)
    }

    // Очистка при размонтировании
    return () => {
      try {
        WebApp.close()
      } catch (error) {
        console.error('Error closing Telegram WebApp:', error)
      }
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
