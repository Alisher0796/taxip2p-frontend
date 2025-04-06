import { useQuery, useMutate } from '@/shared/hooks';
import type { Message } from '@/shared/types/api';

/** Хук для работы с сообщениями */
export function useMessages(orderId: string) {
  /** Получить список сообщений */
  const messages = useQuery<Message[]>({
    key: 'messages',
    path: `/orders/${orderId}/messages`,
  });

  /** Отправить сообщение */
  const sendMessage = useMutate<Message, { text: string }>({
    key: 'sendMessage',
    path: `/orders/${orderId}/messages`,
  });

  return {
    messages,
    sendMessage,
  };
}
