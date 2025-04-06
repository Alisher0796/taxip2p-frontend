export interface WebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramContextType {
  webApp: typeof import('@twa-dev/sdk').default
  user: WebAppUser | null
  isReady: boolean
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
  }
  showMainButton: () => void
  hideMainButton: () => void
  showBackButton: () => void
  hideBackButton: () => void
}
