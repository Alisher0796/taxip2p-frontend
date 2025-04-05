import { HashRouter } from 'react-router-dom'
import { TelegramProvider } from './providers/TelegramProvider/TelegramProvider'
import { QueryProvider } from './providers/QueryProvider'
import { SocketProvider } from './providers/SocketProvider'
import { Router } from './Router'

export function App() {
  return (
    <HashRouter>
      <QueryProvider>
        <SocketProvider>
          <TelegramProvider>
            <Router />
          </TelegramProvider>
        </SocketProvider>
      </QueryProvider>
    </HashRouter>
  )
}
