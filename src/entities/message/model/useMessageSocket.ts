import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/shared/hooks';
import { useContext } from 'react';
import { SocketContext } from '@/app/providers/SocketProvider/context';
import type { Message } from '@/shared/types/api';

/** Хук для работы с сокет-событиями сообщений */
export function useMessageSocket(orderId: string) {
  const queryClient = useQueryClient();
  const { socket } = useContext(SocketContext);
  const { subscribe } = useSocket(socket);

  useEffect(() => {
    /** Обработчик создания сообщения */
    const unsubscribeCreate = subscribe<'message:created', Message>('message:created', (message) => {
      if (message.orderId === orderId) {
        queryClient.setQueryData(['messages', orderId], (messages: Message[] = []) => [...messages, message]);
      }
    });

    return () => {
      unsubscribeCreate();
    };
  }, [queryClient, subscribe, orderId]);
}
