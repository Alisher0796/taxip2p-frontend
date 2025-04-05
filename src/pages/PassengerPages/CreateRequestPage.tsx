import { useNavigate } from 'react-router-dom';
import { CreateTripRequestForm } from '@/features/trip-request/ui/CreateTripRequestForm';
import { useTripRequestStore } from '@/features/trip-request/model/store';
import { useUserStore } from '@/entities/user/model/store';
import { TripRequest } from '@/shared/types/common';

export const CreateRequestPage = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setCurrentRequest = useTripRequestStore((state) => state.setCurrentRequest);

  const handleSubmit = async (data: Omit<TripRequest, 'id' | 'status' | 'passengerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      // TODO: Заменить на реальный API запрос
      const response = await fetch('/api/trip-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          passengerId: user?.id,
        }),
      });

      const newRequest = await response.json();
      setCurrentRequest(newRequest);
      navigate('/passenger/active');
    } catch (error) {
      console.error('Failed to create request:', error);
      // TODO: Показать ошибку пользователю
    }
  };

  return (
    <div className="container mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold">Создание заявки</h1>
      <CreateTripRequestForm onSubmit={handleSubmit} />
    </div>
  );
};
