import { create } from 'zustand'
import io from 'socket.io-client'

interface SocketStore {
  socket: ReturnType<typeof io> | null
  connect: () => void
  disconnect: () => void
}

const useSocketStore = create<SocketStore>((set) => {
  const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000')

  return {
    socket: null,
    connect: () => {
      socket.connect()
      set({ socket })
    },
    disconnect: () => {
      set((state) => {
        state.socket?.disconnect()
        return { socket: null }
      })
    }
  }
})

export const useSocket = () => {
  const { socket, connect, disconnect } = useSocketStore()

  return {
    socket,
    connect,
    disconnect
  }
}
