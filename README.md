# TaxiP2P Frontend

## Описание

TaxiP2P - это Telegram мини-приложение для поиска попутчиков и водителей. Приложение позволяет пользователям создавать заказы на поездки и предлагать свои услуги в качестве водителя.

## Технологии

- React + TypeScript
- Vite
- React Router
- React Query
- Socket.IO
- Telegram WebApp SDK
- TailwindCSS
- Zustand
- React Hook Form + Zod

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Alisher0796/taxip2p-frontend.git
cd taxip2p-frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл .env и укажите необходимые переменные:
```env
VITE_API_URL=https://backend-production-d89d.up.railway.app/api
VITE_SOCKET_URL=https://backend-production-d89d.up.railway.app
```

## Разработка

Запуск в режиме разработки:
```bash
npm run dev
```

## Сборка

Сборка проекта:
```bash
npm run build
```

## Деплой

Деплой на Vercel:
```bash
npm run deploy
```

## Структура проекта

```
src/
├── app/           # Конфигурация приложения
├── entities/      # Бизнес-сущности
├── features/      # Функциональные модули
├── pages/         # Страницы
├── shared/        # Общие компоненты и утилиты
├── widgets/       # Составные компоненты
```

## Development

- Run `npm run dev` to start the development server
- Run `npm run build` to create a production build
- Run `npm run preview` to preview the production build locally

## License

MIT
