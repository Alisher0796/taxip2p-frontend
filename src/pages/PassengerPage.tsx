import CreateOrder from '../components/passenger/CreateOrder'

export default function PassengerPage() {
  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Создать заказ</h1>
      <CreateOrder />
    </div>
  )
}
