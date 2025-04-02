// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PassengerPage from './pages/PassengerPage'
import DriverPage from './pages/DriverPage'
import NotFoundPage from './pages/NotFoundPage'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import TelegramLogin from './components/auth/TelegramLogin'

function App() {
  return (
    <Router>
      <TelegramLogin />
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/passenger" element={<PassengerPage />} />
            <Route path="/driver" element={<DriverPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
