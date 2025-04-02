import { useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { setAuthHeader } from '../../services/api'

declare global {
  interface Window {
    Telegram: any
  }
}

export default function TelegramLogin() {
  const { setUser } = useUser()

  useEffect(() => {
    const tg = window.Telegram.WebApp
    tg.ready()

    const telegramId = tg.initDataUnsafe?.user?.id
    const username = tg.initDataUnsafe?.user?.username

    if (telegramId) {
      const userData = { telegramId: telegramId.toString(), username }
      setUser(userData)
      setAuthHeader(userData.telegramId)
    }
  }, [setUser])

  return null
}
