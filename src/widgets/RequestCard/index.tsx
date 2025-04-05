import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Order } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';

interface Props {
  order: Order;
  onAccept?: () => Promise<void>;
  onMakeOffer?: (price: number) => Promise<void>;
  showActions?: boolean;
}

export const RequestCard = ({ order, onAccept, onMakeOffer, showActions = true }: Props) => {
  const [isOfferMode, setIsOfferMode] = useState(false);
  const [offerPrice, setOfferPrice] = useState(order.price || 0);

  const statusMap = {
    pending: 'Ожидает',
    negotiating: 'Торг',
    accepted: 'Принят',
    inProgress: 'В пути',
    completed: 'Завершен',
    cancelled: 'Отменен',
  };

  const handleMakeOffer = async () => {
    if (onMakeOffer) {
      await onMakeOffer(offerPrice);
      setIsOfferMode(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {formatDistance(new Date(order.createdAt), new Date(), {
            addSuffix: true,
            locale: ru,
          })}
        </span>
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          {statusMap[order.status]}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div>
          <p className="text-sm text-gray-500">Откуда</p>
          <p className="font-medium">{order.fromAddress}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Куда</p>
          <p className="font-medium">{order.toAddress}</p>
        </div>
      </div>

      <div className="mb-4 flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Цена</p>
          <p className="text-lg font-bold">{order.price ? `${order.price} ₺` : 'Договорная'}</p>
        </div>
        {order.finalPrice && (
          <div>
            <p className="text-sm text-gray-500">Итоговая цена</p>
            <p className="text-lg font-bold text-green-600">{order.finalPrice} ₺</p>
          </div>
        )}
      </div>

      {order.comment && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Комментарий</p>
          <p className="text-gray-700">{order.comment}</p>
        </div>
      )}

      {showActions && order.status === 'pending' && (
        <div className="mt-4 space-y-2">
          {isOfferMode ? (
            <div className="space-y-2">
              <Input
                type="number"
                min={0}
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                placeholder="Введите вашу цену"
              />
              <div className="flex space-x-2">
                <Button onClick={handleMakeOffer} variant="primary">
                  Предложить
                </Button>
                <Button onClick={() => setIsOfferMode(false)} variant="outline">
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={onAccept} variant="primary">
                Принять заказ
              </Button>
              <Button onClick={() => setIsOfferMode(true)} variant="outline">
                Предложить цену
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
