import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button/Button'
import { Role } from '@/shared/types/common'
import { createHttp } from '@/shared/api/http'
import { useTelegram } from '@/app/providers/TelegramProvider'
import { useEffect, useRef, useState } from 'react'

const RoleSelectPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const { isReady, webApp, hideBackButton, hideMainButton, haptic } = useTelegram()
  const hasNavigated = useRef(false)

  useEffect(() => {
    let cancelled = false

    const checkRole = async () => {
      try {
        console.log('Checking role...')
        const http = createHttp()
        const profile = await http<{ role?: Role }>('/profile')

        console.log('Profile response:', profile)

        if (!cancelled && profile?.role && !hasNavigated.current) {
          const nextRoute = profile.role === 'passenger' ? '/passenger' : '/driver'
          console.log('Navigating to:', nextRoute)
          hasNavigated.current = true
          navigate(nextRoute, { replace: true })
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error checking role:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (isReady && !hasNavigated.current) {
      hideBackButton()
      hideMainButton()
      checkRole()
    }

    return () => {
      cancelled = true
    }
  }, [isReady, navigate, hideBackButton, hideMainButton])

  const handleRoleSelect = async (role: Role) => {
    if (!isReady || !webApp) {
      console.warn('WebApp not ready:', {
        isReady,
        user: webApp?.initDataUnsafe?.user
      })
      throw new Error('Приложение доступно только через Telegram')
    }

    console.log('Selecting role:', role)

    try {
      const http = createHttp()
      await http('/profile', {
        method: 'POST',
        body: { role }
      })

      haptic?.notification('success')

      const nextRoute = role === 'passenger' ? '/passenger' : '/driver'
      console.log('Navigating after role selection:', nextRoute)
      hasNavigated.current = true
      navigate(nextRoute, { replace: true })
    } catch (error) {
      console.error('Error setting role:', error)
      haptic?.notification('error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        {!isReady && (
          <Button
            onClick={() => (window.location.href = 'https://t.me/taxip2p_bot')}
            className="mt-6"
          >
            Открыть в Telegram
          </Button>
        )}
        <h1 className="mb-4 text-xl font-bold text-gray-800">Выберите вашу роль</h1>
        <div className="flex w-full max-w-xs flex-col gap-4">
          <Button
            size="lg"
            onClick={() => handleRoleSelect('passenger')}
            className="w-full"
            disabled={isLoading}
          >
            Я пассажир
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleRoleSelect('driver')}
            className="w-full"
            disabled={isLoading}
          >
            Я водитель
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RoleSelectPage
