import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { SocketProvider } from './providers/SocketProvider'
import { TelegramProvider } from './providers/TelegramProvider'
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
