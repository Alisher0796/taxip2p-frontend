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
    if (!tg) return

    tg.ready()

    const telegramId = tg.initDataUnsafe?.user?.id
    const username = tg.initDataUnsafe?.user?.username

    if (telegramId) {
      const userData = {
        id: telegramId.toString(),               // 👈 ОБЯЗАТЕЛЬНО!
        telegramId: telegramId.toString(),
        username,
      }

      setUser(userData)                          // ✅ теперь всё типизировано
      setAuthHeader(userData.telegramId)
    }
  }, [setUser])

  return null
}
