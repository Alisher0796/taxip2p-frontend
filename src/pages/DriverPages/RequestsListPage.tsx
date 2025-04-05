import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import { RequestCard } from '@/widgets/RequestCard';
import { useOrderStore } from '@/features/order/model/store';
import { useSocket } from '@/app/providers/SocketProvider';
import { Order, OrderStatus } from '@/shared/types/api';

export const RequestsListPage = () => {
  const { socket } = useSocket();
  const setActiveOrders = useOrderStore((state) => state.setActiveOrders);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', 'pending'],
    queryFn: () => api.getOrders('pending'),
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('order:new', (order: Order) => {
      if (order.status === 'pending') {
        setActiveOrders([...(orders || []), order]);
      }
    });

    socket.on('order:updated', (updatedOrder: Order) => {
      if (!orders) return;
      
      setActiveOrders(
        orders.map((order: Order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        ).filter((order: Order) => order.status === 'pending')
      );
    });

    return () => {
      socket.off('order:new');
      socket.off('order:updated');
    };
  }, [socket, setActiveOrders, orders]);

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!orders?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        Нет активных заказов
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Доступные заказы</h1>
      
      <div className="space-y-4">
        {orders.map((order: Order) => (
          <RequestCard
            key={order.id}
            order={order}
            onAccept={async () => {
              await api.updateOrder(order.id, {
                status: 'accepted' as OrderStatus,
                driverId: order.driver?.id
              });
            }}
            onMakeOffer={async (price: number) => {
              await api.createOffer({
                orderId: order.id,
                price
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};
