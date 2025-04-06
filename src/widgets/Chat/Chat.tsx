import { useState, useRef, useEffect, useCallback } from 'react'
import { useContext } from 'react';
import { SocketContext } from '@/app/providers/SocketProvider/context';
import { useTelegram } from '@/app/providers/TelegramProvider'
import { Message } from './Message'
import { MessageInput } from './MessageInput'
import type { Message as MessageType } from './types'

interface ChatProps {
  orderId: string
}

export const Chat = ({ orderId }: ChatProps) => {
  const { socket } = useContext(SocketContext);
  const { haptic, webApp } = useTelegram()
  const [messages, setMessages] = useState<MessageType[]>([])
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleNewMessage = useCallback((message: MessageType) => {
    setMessages((prev) => [...prev, message])
    if (webApp?.platform && ['tdesktop', 'android', 'ios'].includes(webApp.platform)) {
      haptic?.notification('success')
    }
  }, [webApp, haptic])

  // Подключение к комнате чата
  useEffect(() => {
    if (!socket) {
      setError('Socket connection failed')
      return
    }

    setError(null)
    socket.emit('join', { orderId })

    socket.on('newMessage', handleNewMessage)
    socket.on('error', (err: Error) => setError(err.message))

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('error')
      socket.emit('leave', { orderId })
    }
  }, [socket, orderId, handleNewMessage])

  // Автоскролл при новых сообщениях
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (text: string) => {
    if (!socket) {
      setError('Socket connection failed')
      return
    }
    if (!text.trim()) return

    socket.emit('chatMessage', { orderId, text })
    if (webApp?.platform && ['tdesktop', 'android', 'ios'].includes(webApp.platform)) {
      haptic?.impact('light')
    }
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow max-h-[400px] h-[400px] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {error ? (
          <div className="text-red-500 text-center p-2">{error}</div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
