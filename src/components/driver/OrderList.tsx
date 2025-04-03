import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import OrderCard from './OrderCard'

interface Order {
  id: string
  from?: string
  to?: string
  price: number
}

interface OrderListProps {
  onAccept?: () => void
}

export default function OrderList({ onAccept }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/active')
      setOrders(res.data)
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleAcceptOrder = async (id: string) => {
    try {
      await api.post(`/orders/${id}/accept`)
      if (onAccept) onAccept() // ✅ если передали колбэк — переходим в дашборд
    } catch (err) {
      console.error('Ошибка принятия заказа:', err)
      alert('Не удалось принять заказ')
    }
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-gray-500">Нет активных заказов</p>
      ) : (
        orders.map(order => (
          <OrderCard key={order.id} order={order} onAccept={handleAcceptOrder} />
        ))
      )}
    </div>
  )
}
