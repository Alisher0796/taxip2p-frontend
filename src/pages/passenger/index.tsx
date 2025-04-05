import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/store';
import { CreateOrderForm } from '@/features/order/ui/CreateOrderForm';
import { useOrderStore } from '@/features/order/model/store';
import { api } from '@/shared/api/http';
import type { CreateOrderDTO } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider/TelegramProvider';

export default function PassengerPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  const { showBackButton, hideMainButton } = useTelegram();

  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/');
      return;
    }

    showBackButton();
    hideMainButton();
  }, [user, navigate, showBackButton, hideMainButton]);

  const handleSubmit = async (data: CreateOrderDTO) => {
    try {
      const order = await api.createOrder({
        ...data
      });

      setCurrentOrder(order);
      navigate('/passenger/active');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Создать заявку на поездку</h1>
      <CreateOrderForm onSubmit={handleSubmit} />
    </div>
  );
}
