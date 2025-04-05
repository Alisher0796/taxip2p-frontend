import { useEffect } from 'react'
import { useTelegram } from '@/app/providers/TelegramProvider/TelegramProvider'

export function useTelegramTheme() {
  const { webApp } = useTelegram()

  useEffect(() => {
    // Set theme colors based on Telegram theme
    if (webApp?.themeParams) {
      const root = document.documentElement
      const {
        bg_color,
        text_color,
        hint_color,
        button_color,
        button_text_color,
        secondary_bg_color
      } = webApp.themeParams

      root.style.setProperty('--background', bg_color)
      root.style.setProperty('--foreground', text_color)
      root.style.setProperty('--muted', hint_color)
      root.style.setProperty('--muted-foreground', hint_color)
      root.style.setProperty('--primary', button_color)
      root.style.setProperty('--primary-foreground', button_text_color)
      root.style.setProperty('--secondary', secondary_bg_color)
      root.style.setProperty('--secondary-foreground', text_color)
    }
  }, [webApp?.themeParams])
}
