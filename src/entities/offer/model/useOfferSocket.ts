import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/shared/hooks';
import { useContext } from 'react';
import { SocketContext } from '@/app/providers/SocketProvider/context';
import type { PriceOffer } from '@/shared/types/api';

/** Хук для работы с сокет-событиями предложений цены */
export function useOfferSocket(orderId: string) {
  const queryClient = useQueryClient();
  const { socket } = useContext(SocketContext);
  const { subscribe } = useSocket(socket);

  useEffect(() => {
    /** Обработчик создания предложения */
    const unsubscribeCreate = subscribe<'offer:created', PriceOffer>('offer:created', (offer) => {
      if (offer.orderId === orderId) {
        queryClient.setQueryData(['offers', orderId], (offers: PriceOffer[] = []) => [...offers, offer]);
      }
    });

    /** Обработчик обновления предложения */
    const unsubscribeUpdate = subscribe<'offer:updated', PriceOffer>('offer:updated', (offer) => {
      if (offer.orderId === orderId) {
        queryClient.setQueryData(['offers', orderId], (offers: PriceOffer[] = []) =>
          offers.map((item) => (item.id === offer.id ? offer : item)),
        );
      }
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
    };
  }, [queryClient, subscribe, orderId]);
}
