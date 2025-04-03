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
  from?: string
  to?: string
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

  if (!user) return <p className="text-center text-gray-600">Загрузка профиля...</p>
  if (loading) return <p className="text-center text-gray-600">Загрузка...</p>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-black dark:text-white">Активный заказ</h1>

        {order ? (
          <div className="bg-white dark:bg-zinc-800 shadow-md rounded-2xl p-6 space-y-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-300">
              Пассажир: <span className="font-medium">{order.passenger?.username || 'Неизвестно'}</span>
            </div>

            <div className="text-xl font-semibold text-black dark:text-white">
              {order.from || 'Искеле'} → {order.to || 'Фамагуста'}
            </div>

            <div className="text-3xl font-bold text-blue-600">{order.price} ₺</div>

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
              className="w-full text-lg py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
            >
              Завершить поездку
            </button>

            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="w-full text-lg py-3 rounded-2xl border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-neutral-800 font-semibold transition"
            >
              Открыть чат
            </button>

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
              <Chat roomId={order.id} />
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-300 mt-10">Нет активного заказа</p>
        )}
      </div>
    </div>
  )
}
