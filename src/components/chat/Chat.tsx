import { useEffect, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { useUser } from '../../context/UserContext'
import MessageList from './MessageList'

interface Message {
  id: number
  username: string
  text: string
  time: string
  isOwn: boolean
}

export default function Chat({ roomId }: { roomId: string }) {
  const socket = useSocket()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.emit('join', { roomId })

    socket.on('newMessage', (msg: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        username: msg.username,
        text: msg.text,
        time: new Date(msg.time).toLocaleTimeString(),
        isOwn: msg.username === user?.username
      }])
    })

    return () => {
      socket.off('newMessage')
    }
  }, [socket, roomId, user])

  const sendMessage = () => {
    if (!text.trim()) return
    socket?.emit('chatMessage', { roomId, text })
    setText('')
  }

  return (
    <div>
      <MessageList messages={messages} />
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Введите сообщение..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}
