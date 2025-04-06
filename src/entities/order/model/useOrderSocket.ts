import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/shared/hooks';
import { useContext } from 'react';
import { SocketContext } from '@/app/providers/SocketProvider/context';
import type { Order } from '@/shared/types/api';

/** Хук для работы с сокет-событиями заказа */
export function useOrderSocket() {
  const queryClient = useQueryClient();
  const { socket } = useContext(SocketContext);
  const { subscribe } = useSocket(socket);

  useEffect(() => {
    /** Обработчик создания заказа */
    const unsubscribeCreate = subscribe<'order:created', Order>('order:created', (order) => {
      queryClient.setQueryData(['orders'], (orders: Order[] = []) => [...orders, order]);
    });

    /** Обработчик обновления заказа */
    const unsubscribeUpdate = subscribe<'order:updated', Order>('order:updated', (order) => {
      queryClient.setQueryData(['orders'], (orders: Order[] = []) =>
        orders.map((item) => (item.id === order.id ? order : item)),
      );
      queryClient.setQueryData(['order', order.id], order);
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
    };
  }, [queryClient, subscribe]);
}
