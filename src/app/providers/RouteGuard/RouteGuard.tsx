import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '../TelegramProvider/hooks'
import { api } from '@/shared/api/http'
import { LoadingScreen } from '@/shared/ui/LoadingScreen'
import { Role } from '@/shared/types/common'

interface RouteGuardProps {
  children: ReactNode
  requiredRole?: Role
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isReady } = useTelegram()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isReady) return

    const checkAccess = async () => {
      try {
        const profile = await api.getProfile()
        
        if (requiredRole && profile.role !== requiredRole) {
          console.log('Access denied:', { required: requiredRole, current: profile.role })
          navigate('/', { replace: true })
          return
        }

        if (!profile.role) {
          console.log('No role assigned, redirecting to role selection')
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Access check failed:', error)
        navigate('/', { replace: true })
      }
    }

    checkAccess()
  }, [isReady, requiredRole, navigate])

  if (!isReady) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
