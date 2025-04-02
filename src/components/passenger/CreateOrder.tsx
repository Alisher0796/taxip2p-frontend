import { useState } from 'react'
import { api } from '../../services/api'

export default function CreateOrder() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/orders', { from, to, price: Number(price) })
      alert('Заказ успешно создан!')
      setFrom('')
      setTo('')
      setPrice('')
    } catch (err) {
      console.error(err)
      alert('Ошибка создания заказа!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        className="border rounded p-2 w-full"
        placeholder="Откуда"
        value={from}
        onChange={e => setFrom(e.target.value)}
      />
      <input
        required
        className="border rounded p-2 w-full"
        placeholder="Куда"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <input
        required
        type="number"
        className="border rounded p-2 w-full"
        placeholder="Цена"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 w-full"
      >
        {loading ? 'Создание...' : 'Создать заказ'}
      </button>
    </form>
  )
}
