import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import OrderCard from './OrderCard'

interface Order {
  id: number
  from: string
  to: string
  price: number
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/active')
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleAcceptOrder = async (id: number) => {
    try {
      await api.post(`/orders/${id}/accept`)
      alert('Заказ принят!')
      fetchOrders()
    } catch (err) {
      console.error(err)
      alert('Ошибка принятия заказа!')
    }
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p>Нет активных заказов.</p>
      ) : orders.map(order => (
        <OrderCard key={order.id} {...order} onAccept={handleAcceptOrder} />
      ))}
    </div>
  )
}
