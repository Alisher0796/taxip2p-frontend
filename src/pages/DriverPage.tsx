import OrderList from '../components/driver/OrderList'
import Chat from '../components/chat/Chat'

export default function DriverPage() {
  const roomId = "general" // Позже здесь будет реальный ID заказа

  return (
    <div className="container mx-auto p-4 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Активные заказы</h1>
      <OrderList />

      <h2 className="text-xl font-bold">Чат заказа</h2>
      <Chat roomId={roomId} />
    </div>
  )
}
