interface DriverOfferCardProps {
  price: number
  from: string
  to: string
  onAccept: () => void
  onReject: () => void
}

export default function DriverOfferCard({
  price,
  from,
  to,
  onAccept,
  onReject,
}: DriverOfferCardProps) {
  return (
    <div className="bg-white text-center px-4 py-6 rounded-2xl shadow-md space-y-4">
      <p className="text-lg font-semibold">
        Водитель предлагает <span className="text-2xl font-bold">{price}₺</span> за маршрут
      </p>
      <p className="text-xl font-bold">
        {from} <span className="text-blue-600">→</span> {to}
      </p>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={onAccept}
          className="bg-blue-600 text-white py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition"
        >
          Принять предложение
        </button>
        <button
          onClick={onReject}
          className="border border-blue-600 text-blue-600 py-3 rounded-xl text-base font-semibold hover:bg-blue-50 transition"
        >
          Отклонить
        </button>
      </div>
    </div>
  )
}
