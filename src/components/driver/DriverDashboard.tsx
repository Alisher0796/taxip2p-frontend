import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useUser } from '@/context/UserContext'
import Chat from '@/components/chat/Chat'

interface Order {
  id: string
  price: number
  status: string
  passenger?: {
    username?: string
  }
}

export default function DriverDashboard() {
  const { user } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAcceptedOrder = async () => {
    setLoading(true)
    try {
      const res = await api.get<Order[]>('/orders')
      const active = Array.isArray(res.data)
        ? res.data.find((o) => o.status === 'accepted')
        : null
      setOrder(active || null)
    } catch (err) {
      console.error('Ошибка получения заказа:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAcceptedOrder()
  }, [])

  if (!user) return <p className="text-center">Загрузка профиля...</p>
  if (loading) return <p className="text-center">Загрузка...</p>

  return (
    <div className="container mx-auto p-4 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Активный заказ</h1>

      {order ? (
        <div className="bg-white dark:bg-zinc-800 shadow-md rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <p>
              <strong>Пассажир:</strong>{' '}
              {order.passenger?.username || 'Неизвестно'}
            </p>
            <p>
              <strong>Цена:</strong> {order.price} ₺
            </p>
          </div>

          <button
            onClick={async () => {
              try {
                await api.put(`/orders/${order.id}/complete`)
                setOrder(null)
                console.log('Поездка завершена')
              } catch (e) {
                console.error('Ошибка завершения поездки:', e)
              }
            }}
            className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            Завершить поездку
          </button>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Чат с пассажиром</h2>
            <Chat roomId={order.id} />
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">Нет активного заказа</p>
      )}
    </div>
  )
}
