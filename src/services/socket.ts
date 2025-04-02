import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (telegramId: string): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      extraHeaders: {
        'x-telegram-id': telegramId
      }
    })
  }

  return socket
}
