import { createContext } from 'react'
import io from 'socket.io-client'

interface SocketContextType {
  socket: ReturnType<typeof io> | null
  isConnected: boolean
}

export const SocketContext = createContext<SocketContextType | null>(null)
