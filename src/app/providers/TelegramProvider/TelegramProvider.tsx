import { ReactNode, useCallback, useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { TelegramContext } from './context'
import { LoadingScreen } from '@/shared/ui/LoadingScreen'
import { WebAppUser } from './types'

interface TelegramProviderProps {
  children: ReactNode
}

const MAX_INIT_ATTEMPTS = 5
const INIT_RETRY_DELAY = 500

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<Error | null>(null)
  const [initAttempts, setInitAttempts] = useState(0)
  const [user, setUser] = useState<WebAppUser | null>(null)

  const checkWebApp = useCallback(() => {
    const userExists = !!WebApp?.initDataUnsafe?.user
    const initDataPresent = !!WebApp?.initData
    return userExists && initDataPresent
  }, [])

  useEffect(() => {
    const initializeWebApp = async () => {
      try {
        if (checkWebApp()) {
          const webAppUser = WebApp.initDataUnsafe?.user
          
          console.log('WebApp initialized:', {
            initData: WebApp.initData,
            user: webAppUser,
          })

          if (webAppUser) {
            setUser(webAppUser)
          }

          WebApp.ready()
          WebApp.expand()
          setIsInitialized(true)
          return
        }

        if (initAttempts >= MAX_INIT_ATTEMPTS) {
          throw new Error('Failed to initialize Telegram WebApp')
        }

        const timeoutId = setTimeout(() => {
          setInitAttempts(prev => prev + 1)
        }, INIT_RETRY_DELAY)

        return () => clearTimeout(timeoutId)
      } catch (error) {
        console.error('WebApp initialization error:', error)
        setInitError(error instanceof Error ? error : new Error('Unknown error'))
      }
    }

    if (!isInitialized && !initError) {
      initializeWebApp()
    }
  }, [checkWebApp, initAttempts, isInitialized, initError])

  const hideBackButton = useCallback(() => {
    if (WebApp?.BackButton) {
      WebApp.BackButton.hide()
    }
  }, [])

  const showBackButton = useCallback(() => {
    if (WebApp?.BackButton) {
      WebApp.BackButton.show()
    }
  }, [])

  const hideMainButton = useCallback(() => {
    if (WebApp?.MainButton) {
      WebApp.MainButton.hide()
    }
  }, [])

  const showMainButton = useCallback(() => {
    if (WebApp?.MainButton) {
      WebApp.MainButton.show()
    }
  }, [])

  const haptic = WebApp?.HapticFeedback ? {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      WebApp.HapticFeedback?.impactOccurred(style)
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      WebApp.HapticFeedback?.notificationOccurred(type)
    },
  } : undefined

  if (initError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-4 text-xl font-bold text-gray-800">
            Ошибка инициализации
          </h1>
          <p className="text-gray-600">{initError.message}</p>
          <button
            onClick={() => window.location.href = 'https://t.me/taxip2p_bot'}
            className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Открыть в Telegram
          </button>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return <LoadingScreen />
  }

  return (
    <TelegramContext.Provider
      value={{
        isReady: isInitialized,
        webApp: WebApp,
        user,
        hideBackButton,
        showBackButton,
        hideMainButton,
        showMainButton,
        haptic,
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}
