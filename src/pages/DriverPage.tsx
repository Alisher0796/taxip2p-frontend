import { useNavigate } from 'react-router-dom'
import OrderList from '../components/driver/OrderList'
import Chat from '../components/chat/Chat'

export default function DriverPage() {
  const navigate = useNavigate()
  const roomId = "general" // пока временно

  const handleOrderAccepted = () => {
    navigate('/driver/dashboard') // 🔁 после принятия — перейти на дашборд
  }

  return (
    <div className="container mx-auto p-4 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Активные заказы</h1>

      {/* OrderList должен вызывать handleOrderAccepted после принятия */}
      <OrderList onAccept={handleOrderAccepted} />

      <h2 className="text-xl font-bold">Чат заказа</h2>
      <Chat roomId={roomId} />
    </div>
  )
}
