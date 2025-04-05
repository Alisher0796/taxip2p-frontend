import { useNavigate } from 'react-router-dom';
import { CreateOrderForm } from '@/features/order/ui/CreateOrderForm';
import { useOrderStore } from '@/features/order/model/store';
import { Order } from '@/shared/types/api';
import { api } from '@/shared/api/http';

export const CreateRequestPage = () => {
  const navigate = useNavigate();
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  const handleSubmit = async (data: Omit<Order, 'id' | 'status' | 'passenger' | 'driver' | 'offers' | 'messages' | 'createdAt' | 'updatedAt'>) => {
    try {
      const order = await api.createOrder({
        ...data
      });

      setCurrentOrder(order);
      navigate('/passenger/active');
    } catch (error) {
      console.error('Failed to create order:', error);
      // TODO: Показать ошибку пользователю
    }
  };

  return (
    <div className="container mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold">Создание заявки</h1>
      <CreateOrderForm onSubmit={handleSubmit} />
    </div>
  );
};
