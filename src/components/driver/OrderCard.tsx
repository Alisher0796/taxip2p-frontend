interface OrderCardProps {
    id: number
    from: string
    to: string
    price: number
    onAccept: (id: number) => void
  }
  
  export default function OrderCard({ id, from, to, price, onAccept }: OrderCardProps) {
    return (
      <div className="border p-4 rounded shadow">
        <p><strong>Откуда:</strong> {from}</p>
        <p><strong>Куда:</strong> {to}</p>
        <p><strong>Цена:</strong> {price} $</p>
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded mt-2 p-2 w-full"
          onClick={() => onAccept(id)}
        >
          Принять заказ
        </button>
      </div>
    )
  }
  