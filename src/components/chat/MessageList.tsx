import Message from './Message'

interface Message {
  id: number
  username: string
  text: string
  time: string
  isOwn: boolean
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="overflow-auto h-64 p-4 border rounded mb-2 bg-gray-50">
      {messages.map(msg => (
        <Message key={msg.id} {...msg} />
      ))}
    </div>
  )
}
