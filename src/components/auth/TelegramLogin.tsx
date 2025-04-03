import { useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { setAuthHeader } from '@/services/api'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id: number
            username?: string
          }
        }
        ready: () => void
      }
    }
  }
}

export default function TelegramLogin() {
  const { setUser } = useUser()

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    console.log('[TelegramLogin] Telegram WebApp:', tg)

    if (!tg) {
      console.warn('Telegram WebApp не найден — fallback user')
      const mockUser = {
        id: '999',
        telegramId: '999',
        username: 'debug_user',
      }
      setUser(mockUser)
      setAuthHeader(mockUser.telegramId)
      return
    }

    tg.ready()

    const telegramId = tg.initDataUnsafe?.user?.id
    const username = tg.initDataUnsafe?.user?.username

    console.log('[TelegramLogin] ID:', telegramId, 'Username:', username)

    if (telegramId) {
      const userData = {
        id: telegramId.toString(),
        telegramId: telegramId.toString(),
        username,
      }

      setUser(userData)
      setAuthHeader(userData.telegramId)
    }
  }, [setUser])

  return null
}
