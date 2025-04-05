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
    const initializeWebApp = () => {
      try {
        // Проверяем, что приложение запущено в Telegram
        if (!window.Telegram?.WebApp) {
          console.warn('Telegram WebApp is not available. Make sure the app is running inside Telegram.')
          return
        }

        if (!WebApp.initData) {
          console.warn('WebApp initData is empty. Make sure the app is running inside Telegram.')
          return
        }

        // Инициализация Telegram WebApp
        WebApp.ready()
        WebApp.expand()
        setIsReady(true)
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error)
      }
    }

    // Запускаем инициализацию с небольшой задержкой
    const timer = setTimeout(initializeWebApp, 100)

    // Очистка при размонтировании
    return () => {
      clearTimeout(timer)
      try {
        if (window.Telegram?.WebApp) {
          // Убираем кнопку и очищаем обработчики
          WebApp.MainButton.hide()
          WebApp.MainButton.offClick(() => {})
          WebApp.BackButton.hide()
          WebApp.BackButton.offClick(() => {})
          WebApp.close()
        }
      } catch (error) {
        console.error('Error cleaning up WebApp:', error)
      }
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

  const showMainButton = () => WebApp.MainButton.show()
  const hideMainButton = () => WebApp.MainButton.hide()
  const showBackButton = () => WebApp.BackButton.show()
  const hideBackButton = () => WebApp.BackButton.hide()

  const value = {
    webApp: WebApp,
    user: WebApp.initDataUnsafe.user,
    haptic,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}
