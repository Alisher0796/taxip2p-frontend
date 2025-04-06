import { useEffect } from 'react'
import { useTelegram } from '@/app/providers/TelegramProvider'
import type { ThemeParams } from '@/shared/types/telegram'

export function useTelegramTheme() {
  const { webApp } = useTelegram()

  const applyTheme = (params: ThemeParams) => {
    const root = document.documentElement

    root.style.setProperty('--background', params.bg_color || '#ffffff')
    root.style.setProperty('--foreground', params.text_color || '#000000')
    root.style.setProperty('--muted', params.hint_color || '#999999')
    root.style.setProperty('--muted-foreground', params.hint_color || '#999999')
    root.style.setProperty('--primary', params.button_color || '#0088cc')
    root.style.setProperty('--primary-foreground', params.button_text_color || '#ffffff')
    root.style.setProperty('--secondary', params.secondary_bg_color || '#f0f0f0')
    root.style.setProperty('--secondary-foreground', params.text_color || '#000000')
  }

  useEffect(() => {
    if (!webApp?.themeParams) return

    applyTheme(webApp.themeParams)

    const handler = () => {
      if (webApp.themeParams) {
        applyTheme(webApp.themeParams)
      }
    }

    webApp.onEvent('themeChanged', handler)

    return () => {
      webApp.offEvent('themeChanged', handler)
    }
  }, [webApp])
}
