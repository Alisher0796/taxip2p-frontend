import { useEffect, useState } from 'react'
import { createSocket } from '@/shared/api/socket'
import { useUserStore } from '@/entities/user/model/store'

export const useSocketConnection = (): ReturnType<typeof createSocket> | null => {
  const user = useUserStore((state) => state.user)
  const [socket, setSocket] = useState<ReturnType<typeof createSocket> | null>(null)

  useEffect(() => {
    if (user?.id) {
      const newSocket = createSocket()
      newSocket.emit('auth', { userId: user.id })
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
        setSocket(null)
      }
    }
  }, [user?.id])

  return socket
}
