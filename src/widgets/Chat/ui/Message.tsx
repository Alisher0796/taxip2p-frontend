import { useContext } from 'react'
import { TelegramContext } from '@/app/providers/TelegramProvider/context'
import type { Message as MessageType } from '../model/types'
import { cn } from '@/shared/lib/utils'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const context = useContext(TelegramContext)
  const isMine = context?.user ? message.userId === context.user.id.toString() : false

  return (
    <div
      className={cn(
        'max-w-[75%] px-4 py-2 rounded-xl text-sm',
        isMine
          ? 'ml-auto bg-primary text-primary-foreground'
          : 'mr-auto bg-muted text-muted-foreground'
      )}
    >
      {!isMine && (
        <p className="text-xs font-semibold mb-1 text-muted-foreground">
          @{message.username || 'Пользователь'}
        </p>
      )}
      <p>{message.text}</p>
      <p className="text-[10px] text-right mt-1 opacity-70">
        {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  )
}
