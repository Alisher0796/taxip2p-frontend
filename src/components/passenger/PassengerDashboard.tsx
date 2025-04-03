import DriverOfferCard from '@/components/driver/DriverOfferCard'

export default function PassengerDashboard() {
  const handleAccept = () => {
    console.log('Пассажир принял предложение')
    // тут может быть api.put(`/orders/${id}/accept`)
  }

  const handleReject = () => {
    console.log('Пассажир отклонил предложение')
    // тут может быть api.put(`/orders/${id}/reject`)
  }

  return (
    <div className="p-4">
      <DriverOfferCard
        price={400}
        from="Искеле"
        to="Фамагуста"
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  )
}
