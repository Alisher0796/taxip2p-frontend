import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/store';
import { CreateTripRequestForm } from '@/features/trip-request/ui/CreateTripRequestForm';

export default function PassengerPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Создать заявку на поездку</h1>
      <CreateTripRequestForm onSubmit={async (data) => {
        try {
          // TODO: Implement trip request creation
          console.log('Trip request data:', data);
        } catch (error) {
          console.error('Failed to create trip request:', error);
        }
      }} />
    </div>
  );
}
