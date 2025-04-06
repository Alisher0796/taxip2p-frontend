import { useState, useRef, useEffect } from 'react'
import { useTelegram } from '@/app/providers/TelegramProvider'
import { Button } from '@/shared/ui/Button'

interface MessageInputProps {
  onSend: (text: string) => void
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('')
  const { webApp } = useTelegram()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Адаптируем высоту textarea под контент
  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.style.height = 'auto'
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
  }, [text])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    onSend(text)
    setText('')

    // Возвращаем фокус на поле ввода
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-3 border-t dark:border-zinc-700"
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Сообщение..."
        rows={1}
        className="flex-1 resize-none bg-transparent border-none outline-none text-sm"
        style={{
          maxHeight: '120px',
          minHeight: '24px',
          color: webApp?.themeParams?.text_color
        }}
      />
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={!text.trim()}
      >
        Отправить
      </Button>
    </form>
  )
}
