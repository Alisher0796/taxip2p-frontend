import { useMemo } from 'react'
import { useTelegram } from '@/app/providers/TelegramProvider'
import { Message as MessageType } from './types'
import dayjs from 'dayjs'

interface MessageProps {
  message: MessageType
}

export const Message = ({ message }: MessageProps) => {
  const { user } = useTelegram()
  
  const isOwnMessage = useMemo(() => {
    return message.userId === user?.id
  }, [message.userId, user?.id])

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        <div className="text-sm">{message.text}</div>
        <div className="text-xs opacity-70 mt-1">
          {dayjs(message.createdAt).format('HH:mm')}
        </div>
      </div>
    </div>
  )
}
