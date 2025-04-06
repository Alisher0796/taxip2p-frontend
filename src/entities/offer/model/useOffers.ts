import { useQuery, useMutate } from '@/shared/hooks';
import type { PriceOffer } from '@/shared/types/api';

/** Хук для работы с предложениями цены */
export function useOffers(orderId: string) {
  /** Получить список предложений */
  const offers = useQuery<PriceOffer[]>({
    key: 'offers',
    path: `/orders/${orderId}/offers`,
  });

  /** Создать предложение */
  const createOffer = useMutate<PriceOffer, { price: number }>({
    key: 'createOffer',
    path: '/offers',
  });

  /** Обновить предложение */
  const updateOffer = useMutate<PriceOffer, { status: 'accepted' | 'rejected' }>({
    key: 'updateOffer',
    path: `/offers/${orderId}`,
    method: 'PUT',
  });

  return {
    offers,
    createOffer,
    updateOffer,
  };
}
