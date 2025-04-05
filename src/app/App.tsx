import { BrowserRouter } from 'react-router-dom'
import { TelegramProvider } from './providers/TelegramProvider'
import { QueryProvider } from './providers/QueryProvider'
import { Router } from './Router'

export function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <TelegramProvider>
          <Router />
        </TelegramProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}
