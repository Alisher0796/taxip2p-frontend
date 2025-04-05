import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTelegram } from '@/app/providers/TelegramProvider'

export function useTelegramNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { webApp } = useTelegram()

  useEffect(() => {
    // Enable back button only if we're not on the home page
    if (location.pathname !== '/') {
      webApp?.BackButton.show()
    } else {
      webApp?.BackButton.hide()
    }

    const handleBackClick = () => {
      navigate(-1)
    }

    webApp?.BackButton.onClick(handleBackClick)

    return () => {
      webApp?.BackButton.offClick(handleBackClick)
    }
  }, [location.pathname, navigate, webApp])
}
