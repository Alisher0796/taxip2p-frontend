import { Card, CardContent, CardFooter } from '@/shared/ui'
import { Button } from '@/shared/ui/Button/Button'
import { Order } from '@/shared/types/api'

interface OrderCardProps {
  order: Order
  onAccept?: () => Promise<void>
}

export function OrderCard({ order, onAccept }: OrderCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">От</p>
            <p className="text-sm text-gray-500">{order.fromAddress}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">До</p>
            <p className="text-sm text-gray-500">{order.toAddress}</p>
          </div>
        </div>

        {order.price && (
          <div>
            <p className="text-sm font-medium text-gray-900">Цена</p>
            <p className="text-sm text-gray-500">{order.price} ₺</p>
          </div>
        )}

        {order.comment && (
          <div>
            <p className="text-sm font-medium text-gray-900">Комментарий</p>
            <p className="text-sm text-gray-500">{order.comment}</p>
          </div>
        )}
      </CardContent>

      {onAccept && (
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={onAccept}
            className="w-full"
          >
            Принять
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

OrderCard.displayName = 'OrderCard';
