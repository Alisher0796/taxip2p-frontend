import { useState, FormEvent } from 'react'
import { useTelegram } from '@/app/providers/TelegramProvider'
import { Button } from '@/shared/ui/Button'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [text, setText] = useState('')
  const { webApp } = useTelegram()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    onSend(text.trim())
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t dark:border-gray-800"
      style={{
        backgroundColor: webApp?.themeParams?.bg_color || '#ffffff',
        borderColor: `${webApp?.themeParams?.text_color || '#000000'}1A`
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder="Введите сообщение..."
        className="flex-1 bg-transparent border-none outline-none"
        style={{
          color: webApp?.themeParams?.text_color || '#000000'
        }}
      />
      <Button
        type="submit"
        disabled={!text.trim() || disabled}
      >
        Отправить
      </Button>
    </form>
  )
}
