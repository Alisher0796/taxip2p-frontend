import { useQuery, useMutate } from '@/shared/hooks';
import type { Order, OrderStatus } from '@/shared/types/api';
import type { CreateOrderDTO, UpdateOrderDTO } from '@/shared/api/http';

/** Хук для работы с заказами */
export function useOrders(status?: OrderStatus) {
  /** Получить список заказов */
  const orders = useQuery<Order[]>({
    key: 'orders',
    path: '/orders',
    params: status ? { status } : undefined,
  });

  /** Создать заказ */
  const createOrder = useMutate<Order, CreateOrderDTO>({
    key: 'createOrder',
    path: '/orders',
  });

  return {
    orders,
    createOrder,
  };
}

/** Хук для работы с заказом */
export function useOrder(id: string) {
  /** Получить заказ */
  const order = useQuery<Order>({
    key: 'order',
    path: `/orders/${id}`,
  });

  /** Обновить заказ */
  const updateOrder = useMutate<Order, UpdateOrderDTO>({
    key: 'updateOrder',
    path: `/orders/${id}`,
    method: 'PUT',
  });

  return {
    order,
    updateOrder,
  };
}
