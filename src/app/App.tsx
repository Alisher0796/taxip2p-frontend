import { BrowserRouter } from 'react-router-dom'
import { TelegramProvider } from './providers/TelegramProvider'
import { QueryProvider } from './providers/QueryProvider'
import { SocketProvider } from './providers/SocketProvider'
import { Router } from './Router'

export function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <SocketProvider>
          <TelegramProvider>
            <Router />
          </TelegramProvider>
        </SocketProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}
