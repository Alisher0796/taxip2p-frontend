import { ReactNode, useContext, useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { TelegramContext } from './context'
import type { WebAppUser } from './types'

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
  const [user, setUser] = useState<WebAppUser | null>(null)

  useEffect(() => {
    const initWebApp = () => {
      if (!WebApp?.initDataUnsafe?.user) {
        console.warn('[TelegramProvider] WebApp.initDataUnsafe.user is missing', {
          initData: WebApp?.initData,
          user: WebApp?.initDataUnsafe?.user
        })
        return
      }

      setIsReady(true)
      setUser(WebApp.initDataUnsafe.user)

      WebApp.ready()
      WebApp.expand()

      console.log('[TelegramProvider] Telegram WebApp initialized:', {
        initData: WebApp.initData,
        user: WebApp.initDataUnsafe.user,
      })
    }

    initWebApp()

    return () => {
      try {
        WebApp.MainButton.hide()
        WebApp.BackButton.hide()
        WebApp.MainButton.offClick?.(() => {})
        WebApp.BackButton.offClick?.(() => {})
      } catch (error) {
        console.warn('[TelegramProvider] Cleanup error:', error)
      }
    }
  }, [])

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      try {
        WebApp.HapticFeedback?.impactOccurred(style)
      } catch (error) {
        console.warn('[TelegramProvider] Haptic impact error:', error)
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      try {
        WebApp.HapticFeedback?.notificationOccurred(type)
      } catch (error) {
        console.warn('[TelegramProvider] Haptic notification error:', error)
      }
    },
  }

  const showMainButton = () => WebApp.MainButton?.show()
  const hideMainButton = () => WebApp.MainButton?.hide()
  const showBackButton = () => WebApp.BackButton?.show()
  const hideBackButton = () => WebApp.BackButton?.hide()

  return (
    <TelegramContext.Provider
      value={{
        webApp: WebApp,
        user,
        isReady,
        haptic,
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
