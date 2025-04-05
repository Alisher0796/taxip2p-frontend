import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { PriceOffer } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button/Button';
import { cn } from '@/shared/lib/cn';

interface Props {
  offers: PriceOffer[];
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  showActions?: boolean;
}

export const OffersList = ({ offers, onAccept, onReject, showActions = true }: Props) => {
  if (!offers.length) {
    return (
      <div className="text-center text-gray-500">
        Пока нет предложений от водителей
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {formatDistance(new Date(offer.createdAt), new Date(), {
                addSuffix: true,
                locale: ru,
              })}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                {
                  'bg-yellow-100 text-yellow-800': offer.status === 'pending',
                  'bg-green-100 text-green-800': offer.status === 'accepted',
                  'bg-red-100 text-red-800': offer.status === 'rejected',
                }
              )}
            >
              {offer.status === 'pending' && 'Ожидает ответа'}
              {offer.status === 'accepted' && 'Принято'}
              {offer.status === 'rejected' && 'Отклонено'}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Предложенная цена</p>
            <p className="text-lg font-bold">{offer.price} ₺</p>
          </div>

          {showActions && offer.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onAccept?.(offer.id)}
              >
                Принять
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onReject?.(offer.id)}
              >
                Отклонить
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
