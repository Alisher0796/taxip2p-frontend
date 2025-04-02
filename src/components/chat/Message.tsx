interface MessageProps {
    username: string
    text: string
    time: string
    isOwn: boolean
  }
  
  export default function Message({ username, text, time, isOwn }: MessageProps) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`rounded-lg p-2 max-w-xs ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          <div className="text-sm font-semibold">{username}</div>
          <div>{text}</div>
          <div className="text-xs text-right">{time}</div>
        </div>
      </div>
    )
  }
  