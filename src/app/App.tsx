import React from 'react'
import { HashRouter } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import { TelegramProvider } from './providers/TelegramProvider/TelegramProvider'
import { QueryProvider } from './providers/QueryProvider'
import { SocketProvider } from './providers/SocketProvider'
import { Router } from './Router'

export function App() {
  const [isWebView, setIsWebView] = React.useState(false);

  React.useEffect(() => {
    // Проверяем наличие WebApp
    const checkWebApp = () => {
      const isWebApp = !!WebApp?.initDataUnsafe?.user;
      console.log('Checking WebApp:', { 
        initData: WebApp.initData,
        user: WebApp.initDataUnsafe?.user,
        isWebApp
      });
      setIsWebView(isWebApp);
    };

    // Проверяем сразу и через небольшую задержку
    checkWebApp();
    const timer = setTimeout(checkWebApp, 1000);

    return () => clearTimeout(timer);
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
