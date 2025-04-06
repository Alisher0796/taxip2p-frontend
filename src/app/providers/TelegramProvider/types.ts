export interface WebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface HapticFeedback {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  notification: (type: 'error' | 'success' | 'warning') => void
}

export interface TelegramContextType {
  webApp: typeof import('@twa-dev/sdk').default
  user: WebAppUser | null
  isReady: boolean
  haptic: HapticFeedback | undefined
  showMainButton: () => void
  hideMainButton: () => void
  showBackButton: () => void
  hideBackButton: () => void
}
