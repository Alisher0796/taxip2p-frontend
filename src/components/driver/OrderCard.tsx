interface Order {
  id: string
  from?: string
  to?: string
  price: number
}

interface OrderCardProps {
  order: Order
  onAccept: (id: string) => void
}

export default function OrderCard({ order, onAccept }: OrderCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 space-y-2">
      <p className="text-lg font-semibold text-gray-800 dark:text-white">📍 Маршрут</p>
      <p className="text-gray-600 dark:text-gray-300">
        {order.from || '—'} → {order.to || '—'}
      </p>

      <p className="text-gray-600 dark:text-gray-300">
        💰 <span className="font-medium">{order.price} ₽</span>
      </p>

      <button
        onClick={() => onAccept(order.id)}
        className="w-full bg-blue-600 text-white py-2 mt-3 rounded-xl hover:bg-blue-700 transition"
      >
        Принять заказ
      </button>
    </div>
  )
}
