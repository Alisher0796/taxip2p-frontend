import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TripRequest } from '@/shared/types/common';
import { Button } from '@/shared/ui/Button/Button';

interface Props {
  request: TripRequest;
  onAccept?: () => void;
  onMakeOffer?: () => void;
  showActions?: boolean;
}

export const RequestCard = ({ request, onAccept, onMakeOffer, showActions = true }: Props) => {
  const pickupTimeMap = {
    'PT15M': '15 минут',
    'PT30M': '30 минут',
    'PT1H': '1 час',
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {formatDistance(new Date(request.createdAt), new Date(), {
            addSuffix: true,
            locale: ru,
          })}
        </span>
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          {request.status === 'active' ? 'Активная' : 'В процессе'}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div>
          <p className="text-sm text-gray-500">Откуда</p>
          <p className="font-medium">{request.fromAddress}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Куда</p>
          <p className="font-medium">{request.toAddress}</p>
        </div>
      </div>

      <div className="mb-4 flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Желаемая цена</p>
          <p className="text-lg font-bold">{request.desiredPrice} ₺</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Подача через</p>
          <p className="font-medium">{pickupTimeMap[request.pickupTime]}</p>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={onAccept}
          >
            Принять цену
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onMakeOffer}
          >
            Предложить цену
          </Button>
        </div>
      )}
    </div>
  );
};
