import { HashRouter } from 'react-router-dom'
import { TelegramProvider } from './providers/TelegramProvider/TelegramProvider'
import { QueryProvider } from './providers/QueryProvider'
import { SocketProvider } from './providers/SocketProvider'
import { Router } from './Router'
import { AppInitializer } from './providers/AppInitializer'

/**
 * Главный компонент приложения с улучшенной логикой инициализации
 */
export function App() {
  // Проверку нахождения в Telegram теперь выполняет AppInitializer
  // и пользовательский опыт стал более предсказуемым

  return (
    <HashRouter>
      <QueryProvider>
        <SocketProvider>
          <TelegramProvider>
            <AppInitializer>
              <Router />
            </AppInitializer>
          </TelegramProvider>
        </SocketProvider>
      </QueryProvider>
    </HashRouter>
  )
}
