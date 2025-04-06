import { useEffect, useState, useContext } from 'react';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider';
import WebApp from '@twa-dev/sdk';
import type { Message } from '@/shared/types/api';
import { SocketContext } from '@/app/providers/SocketProvider/context';

interface Props {
  orderId: string;
}

export function Chat({ orderId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const { socket } = useContext(SocketContext);
  const { haptic } = useTelegram();

  useEffect(() => {
    // Загружаем историю сообщений
    api.getMessages(orderId).then((messages) => setMessages(messages));

    if (!socket) return;

    // Подписываемся на новые сообщения
    socket.on('message:new', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      haptic?.notification('success');
    });

    return () => {
      socket.off('message:new');
    };
  }, [socket, orderId, haptic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      WebApp.MainButton.showProgress();
      await api.sendMessage(orderId, text.trim());
      setText('');
      haptic?.notification('success');
    } catch (error) {
      console.error('Failed to send message:', error);
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось отправить сообщение. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
      haptic?.notification('error');
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Чат</h3>
      
      <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{message.sender.username}</span>
              <span className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{message.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
