import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useUser } from '@/context/UserContext'
import Chat from '@/components/chat/Chat'

interface Order {
  id: string
  status: string
  price: number
  driver?: {
    username?: string
  }
}

export default function PassengerPage() {
  const { user } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchActiveOrder = async () => {
    setLoading(true)
    try {
      const res = await api.get<Order[]>('/orders/active')
      const passengerOrder = Array.isArray(res.data)
        ? res.data.find((o) => o.status !== 'completed')
        : null
      setOrder(passengerOrder || null)
    } catch (err) {
      console.error('Ошибка загрузки активного заказа:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveOrder()
  }, [])

  const handleCreateOrder = async () => {
    if (!price.trim()) return
    try {
      const res = await api.post<Order>('/orders', {
        price: parseFloat(price),
      })
      setOrder(res.data)
      setPrice('')
    } catch (err) {
      console.error('Ошибка создания заказа:', err)
    }
  }

  if (!user) return <p className="p-4 text-center">Загрузка профиля...</p>
  if (loading) return <p className="p-4 text-center">Загрузка...</p>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">🧍 Заказ пассажира</h1>

      {!order ? (
        <div className="space-y-3">
          <p>Укажите цену поездки:</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Например, 400"
            className="w-full border rounded-xl px-4 py-2"
          />
          <button
            onClick={handleCreateOrder}
            className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition"
          >
            Отправить заявку
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow space-y-3">
          <p>
            💸 <strong>Цена:</strong> {order.price} ₺
          </p>
          <p>
            🚦 <strong>Статус:</strong>{' '}
            {order.status === 'pending'
              ? 'Ожидает водителя'
              : order.status === 'accepted'
              ? 'Принят водителем'
              : 'Завершён'}
          </p>
          {order.driver?.username && (
            <p>
              🚗 <strong>Водитель:</strong> @{order.driver.username}
            </p>
          )}

          {order.status === 'accepted' && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">💬 Чат с водителем</h2>
              <Chat roomId={order.id} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
