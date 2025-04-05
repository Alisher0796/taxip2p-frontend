import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import { QueryProvider } from './providers/QueryProvider'
import { SocketProvider } from './providers/SocketProvider'
import { TelegramProvider } from './providers/TelegramProvider'
import { Router } from './Router'

export function App() {
  // Проверяем, что приложение запущено в контексте Telegram WebApp
  const [isWebView, setIsWebView] = React.useState(false);

  React.useEffect(() => {
    // Проверяем наличие WebApp
    const isWebApp = !!WebApp?.initDataUnsafe?.user;
    setIsWebView(isWebApp);
  }, []);

  if (!isWebView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-4 text-xl font-bold text-gray-800">
            Приложение доступно только через Telegram
          </h1>
          <p className="text-gray-600">
            Пожалуйста, откройте это приложение через бота в Telegram
          </p>
        </div>
      </div>
    );
  }

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
  );
}
