import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from '@/context/UserContext'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

interface ChatProps {
  roomId: string
}

interface Message {
  id: string
  text: string
  senderId: string
  sender?: {
    username?: string
  }
  createdAt: string
}

export default function Chat({ roomId }: ChatProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user?.telegramId) return

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      extraHeaders: {
        'x-telegram-id': user.telegramId,
      },
    })

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message])
    }

    socket.emit('join', roomId)
    socket.on('newMessage', handleNewMessage)
    socket.on('connect_error', (err) => {
      console.error('Ошибка подключения к WebSocket:', err)
    })

    socketRef.current = socket

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.disconnect()
    }
  }, [roomId, user?.telegramId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !user) return
    socketRef.current?.emit('chatMessage', { roomId, text: input })
    setInput('')
  }

  if (!user || !('id' in user)) return null

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow max-h-[400px] h-[400px] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => {
          const isMine = msg.senderId === (user as any).id
          const time = dayjs(msg.createdAt).format('HH:mm')

          return (
            <div
              key={msg.id}
              className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                isMine
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              {!isMine && (
                <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  @{msg.sender?.username || 'Пользователь'}
                </p>
              )}
              <p>{msg.text}</p>
              <p className="text-[10px] text-right mt-1 text-gray-300">{time}</p>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      <div className="border-t p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Сообщение..."
          className="flex-1 border rounded-xl px-4 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white rounded-xl px-4"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
