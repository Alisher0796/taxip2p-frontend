import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../model/store';
import { api } from '@/shared/api/http';
import { useTelegram } from '@/app/providers/TelegramProvider';
import WebApp from '@twa-dev/sdk';
import type { PriceOffer } from '@/shared/types/api';

interface Props {
  orderId: string;
}

export function OffersList({ orderId }: Props) {
  const { offers, setOffers } = useOrderStore();
  const { haptic } = useTelegram();

  useEffect(() => {
    // Загружаем предложения при монтировании
    api.getOffers(orderId).then(setOffers);
  }, [orderId, setOffers]);

  const navigate = useNavigate();

  const handleAcceptOffer = async (offer: PriceOffer) => {
    try {
      WebApp.MainButton.showProgress();
      await api.updateOffer(offer.id, { status: 'accepted' });
      await api.updateOrder(orderId, { 
        status: 'accepted',
        driverId: offer.driverId,
        finalPrice: offer.price
      });
      haptic.notification('success');
      navigate('/driver/active');
    } catch (error) {
      console.error('Failed to accept offer:', error);
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось принять предложение. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
      haptic.notification('error');
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  const handleRejectOffer = async (offer: PriceOffer) => {
    try {
      await api.updateOffer(offer.id, { status: 'rejected' });
      haptic.notification('success');
    } catch (error) {
      console.error('Failed to reject offer:', error);
      WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не удалось отклонить предложение. Попробуйте еще раз.',
        buttons: [{ type: 'ok' }]
      });
      haptic.notification('error');
    }
  };

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Предложения водителей</h3>
      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{offer.driver.username}</p>
                <p className="text-lg font-semibold text-green-600">
                  {offer.price} TL
                </p>
              </div>
              
              {offer.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptOffer(offer)}
                    className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors"
                  >
                    Принять
                  </button>
                  <button
                    onClick={() => handleRejectOffer(offer)}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
                  >
                    Отклонить
                  </button>
                </div>
              )}
              
              {offer.status === 'accepted' && (
                <span className="text-green-600 font-medium">Принято</span>
              )}
              
              {offer.status === 'rejected' && (
                <span className="text-red-600 font-medium">Отклонено</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
