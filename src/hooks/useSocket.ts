import { useEffect, useState } from 'react'
import { getSocket } from '../services/socket'
import { useUser } from '../context/UserContext'
import { Socket } from 'socket.io-client'

export const useSocket = (): Socket | null => {
  const { user } = useUser()
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (user?.telegramId) {
      const newSocket = getSocket(user.telegramId)
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
        setSocket(null)
      }
    }
  }, [user?.telegramId])

  return socket
}
