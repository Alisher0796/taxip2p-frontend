import { createContext, useContext, useEffect, type ReactNode } from 'react'
import WebApp from '@twa-dev/sdk'

interface TelegramContextType {
  webApp: typeof WebApp | null
  user: typeof WebApp['initDataUnsafe']['user'] | null
  isReady: boolean
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
    try {
      // Проверяем, что WebApp доступен
      if (typeof WebApp === 'undefined') {
        console.warn('Telegram WebApp SDK not available, running in standalone mode')
        return
      }

      // Проверяем наличие данных инициализации
      if (!WebApp.initData) {
        console.warn('No WebApp init data available, running in standalone mode')
        return
      }

      // Логируем информацию о WebApp
      console.log('WebApp:', WebApp)
      console.log('WebApp init data:', WebApp.initData)
      console.log('WebApp init data unsafe:', WebApp.initDataUnsafe)
      console.log('WebApp user:', WebApp.initDataUnsafe.user)
      console.log('WebApp platform:', WebApp.platform)
      console.log('WebApp version:', WebApp.version)

      // Сообщаем о готовности и разворачиваем окно
      WebApp.ready()
      WebApp.expand()
    } catch (error) {
      console.warn('Error initializing Telegram WebApp:', error)
      console.warn('Running in standalone mode')
    }

    // Очистка при размонтировании
    return () => {
      try {
        if (typeof WebApp !== 'undefined') {
          WebApp.close()
        }
      } catch (error) {
        console.warn('Error closing Telegram WebApp:', error)
      }
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

  // Проверяем доступность WebApp и данных инициализации
  const isWebAppAvailable = typeof WebApp !== 'undefined' && !!WebApp.initData;

  const value = {
    webApp: isWebAppAvailable ? WebApp : null,
    user: isWebAppAvailable ? WebApp.initDataUnsafe.user : null,
    isReady: isWebAppAvailable,
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
