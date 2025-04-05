import { useState, useRef, useEffect } from 'react'
import { useSocket } from '@/app/providers/SocketProvider'
import { useTelegram } from '@/app/providers/TelegramProvider'
import { Message } from './ui/Message'
import { MessageInput } from './ui/MessageInput'
import type { Message as MessageType } from './model/types'

interface ChatProps {
  orderId: string
}

export function Chat({ orderId }: ChatProps) {
  const { socket } = useSocket()
  const { haptic } = useTelegram()
  const [messages, setMessages] = useState<MessageType[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Подключение к комнате чата
  useEffect(() => {
    if (!socket) return

    socket.emit('join', { orderId })

    const handleNewMessage = (message: MessageType) => {
      setMessages((prev) => [...prev, message])
      haptic.notification('success')
    }

    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.emit('leave', { orderId })
    }
  }, [socket, orderId, haptic])

  // Автоскролл при новых сообщениях
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (text: string) => {
    if (!socket || !text.trim()) return
    socket.emit('chatMessage', { orderId, text })
    haptic.impact('light')
  }

  return (
    <div className="flex flex-col bg-card rounded-2xl shadow max-h-[400px] h-[400px] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={scrollRef} />
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
