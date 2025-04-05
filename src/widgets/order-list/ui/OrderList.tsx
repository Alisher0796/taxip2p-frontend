import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { OrderCard } from '@/entities/order/ui'
import type { Order } from '@/shared/types/api'

export interface OrderListProps {
  title?: string
  orders: Order[]
  onAcceptOrder?: (orderId: string) => Promise<void>
  className?: string
}

export function OrderList({ title = 'Orders', orders, onAcceptOrder, className }: OrderListProps) {
  if (!orders.length) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onAccept={onAcceptOrder ? () => onAcceptOrder(order.id) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  )
}

OrderList.displayName = 'OrderList';
