import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTelegram } from '@/app/providers/TelegramProvider'

export function useTelegramNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { webApp, isReady } = useTelegram()

  useEffect(() => {
    if (!isReady || !webApp?.BackButton) return

    const handleBackClick = () => {
      navigate(-1)
    }

    if (location.pathname !== '/') {
      webApp.BackButton.show()
    } else {
      webApp.BackButton.hide()
    }

    webApp.BackButton.onClick(handleBackClick)

    return () => {
      webApp.BackButton.offClick(handleBackClick)
    }
  }, [location.pathname, navigate, webApp, isReady])
}
