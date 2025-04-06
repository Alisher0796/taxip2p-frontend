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

  // Инициализируем состояние сразу
  useEffect(() => {
    try {
      // Проверяем, что приложение запущено в Telegram
      if (!WebApp.initData) {
        console.warn('WebApp initData is empty')
        return
      }

      setIsReady(true)
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error)
    }

    // Очистка при размонтировании
    return () => {
      try {
        WebApp.MainButton.hide()
        WebApp.MainButton.offClick(() => {})
        WebApp.BackButton.hide()
        WebApp.BackButton.offClick(() => {})
      } catch (error) {
        console.error('Error cleaning up WebApp:', error)
      }
    }
  }, [])

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      try {
        WebApp.HapticFeedback.impactOccurred(style)
      } catch (error) {
        console.error('Error triggering haptic impact:', error)
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      try {
        WebApp.HapticFeedback.notificationOccurred(type)
      } catch (error) {
        console.error('Error triggering haptic notification:', error)
      }
    }
  }

  const showMainButton = () => {
    if (isReady) WebApp.MainButton.show()
  }

  const hideMainButton = () => {
    if (isReady) WebApp.MainButton.hide()
  }

  const showBackButton = () => {
    if (isReady) WebApp.BackButton.show()
  }

  const hideBackButton = () => {
    if (isReady) WebApp.BackButton.hide()
  }

  return (
    <TelegramContext.Provider
      value={{
        webApp: WebApp,
        user: WebApp.initDataUnsafe?.user || null,
        haptic,
        isReady,
        showMainButton,
        hideMainButton,
        showBackButton,
        hideBackButton,
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}
