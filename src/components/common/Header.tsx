import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-xl font-semibold">TaxiP2P</h1>
        <nav>
          <Link className="mx-2 hover:underline" to="/">Главная</Link>
          <Link className="mx-2 hover:underline" to="/passenger">Пассажир</Link>
          <Link className="mx-2 hover:underline" to="/driver">Водитель</Link>
        </nav>
      </div>
    </header>
  )
}
