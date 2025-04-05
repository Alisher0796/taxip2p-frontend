import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/http';
import { RequestCard } from '@/widgets/RequestCard';
import { useTripRequestStore } from '@/features/trip-request/model/store';
import { useSocket } from '@/app/providers/SocketProvider';
import { TripRequest } from '@/shared/types/api';

export const RequestsListPage = () => {
  const { socket } = useSocket();
  const setActiveRequests = useTripRequestStore((state) => state.setActiveRequests);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['tripRequests'],
    queryFn: () => api.getTripRequests(),
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('newTripRequest', (request: TripRequest) => {
      setActiveRequests([...(requests || []), request]);
    });

    socket.on('tripRequestUpdated', (updatedRequest: TripRequest) => {
      if (!requests) return;
      
      setActiveRequests(
        requests.map((req) =>
          req.id === updatedRequest.id ? updatedRequest : req
        )
      );
    });

    return () => {
      socket.off('newTripRequest');
      socket.off('tripRequestUpdated');
    };
  }, [socket, setActiveRequests, requests]);

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!requests?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        Нет активных заявок
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Активные заявки</h1>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onAccept={() => {
              // TODO: Реализовать принятие заявки
            }}
            onMakeOffer={() => {
              // TODO: Реализовать предложение цены
            }}
          />
        ))}
      </div>
    </div>
  );
};
