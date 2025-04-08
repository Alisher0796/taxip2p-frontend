import type { Order, OrderStatus, PriceOffer, Message, Profile } from '@/shared/types/api';
import { safeWebApp } from '@/app/utils/safeTelegram';

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';
const API_PREFIX = '/api';
const IS_DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

if (!BASE_URL) {
  throw new Error('VITE_API_URL is not defined');
}

console.log(`API initialized with URL: ${BASE_URL}${API_PREFIX}, Dev mode: ${IS_DEV_MODE}`);

/** Ответ от API */
export interface ApiResponse<T> {
  /** Данные */
  data: T;
  /** Ошибка */
  error?: string;
  /** Сообщение об ошибке */
  message?: string;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

/** Создает HTTP клиент для работы с API */
export const createHttp = () => {
  return async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    try {
      // Используем безопасный метод доступа к Telegram WebApp
      const webApp = safeWebApp();
      
      if (!webApp) {
        if (IS_DEV_MODE) {
          console.warn('💪 Режим разработки: продолжаем без авторизации Telegram');
          // В режиме разработки добавляем тестовый заголовок авторизации
          requestHeaders['x-test-auth'] = 'development-mode';
        } else {
          throw new Error('Telegram WebApp недоступен');
        }
      } else {
        try {
          // Проверяем наличие данных инициализации
          const initData = webApp.initData;
          
          if (initData && initData.length > 0) {
            // Добавляем все необходимые заголовки для авторизации
            requestHeaders['x-telegram-init-data'] = initData;
            
            // Проверяем, что не требуется URL-энкодинг
            if (initData.includes('%') || initData.includes('+')) {
              console.warn('⚠️ initData может быть URL-энкодирован, пробуем декодировать');
              requestHeaders['x-telegram-init-data'] = decodeURIComponent(initData);
            }

            // Защита от CSRF - добавляем Origin и Referer
            requestHeaders['Origin'] = window.location.origin;
            requestHeaders['Referer'] = window.location.href;
            
            // Добавляем Hash для отладки
            try {
              const dataHash = btoa(initData.slice(0, 20)).replace(/=/g, '');
              requestHeaders['x-telegram-hash'] = dataHash;
            } catch (e) {
              console.warn('⚠️ Не удалось создать хеш для отладки:', e);
            }
            
            // Отладка данных авторизации
            console.info('🔐 Telegram auth data:', { 
              initDataLength: initData.length,
              headers: Object.keys(requestHeaders),
              user: webApp.initDataUnsafe?.user ? 
                `${webApp.initDataUnsafe.user.first_name} (ID: ${webApp.initDataUnsafe.user.id})` : 
                'not available'
            });
          } else {
            console.warn('⚠️ Telegram initData отсутствует или пуст');
            
            if (IS_DEV_MODE) {
              console.warn('💪 Режим разработки: продолжаем без авторизации Telegram');
              // В режиме разработки добавляем тестовый заголовок авторизации
              requestHeaders['x-test-auth'] = 'development-mode';
              requestHeaders['x-skip-auth'] = 'true';
            } else {
              throw new Error('Отсутствуют данные авторизации Telegram');
            }
          }
        } catch (error) {
          console.error('❌ Ошибка при получении Telegram initData:', error);
          
          if (IS_DEV_MODE) {
            console.warn('💪 Режим разработки: продолжаем без авторизации Telegram');
            requestHeaders['x-test-auth'] = 'development-mode';
            requestHeaders['x-skip-auth'] = 'true';
          } else {
            throw new Error('Ошибка авторизации Telegram');
          }
        }
      }

      const fullUrl = `${BASE_URL}${API_PREFIX}${endpoint}`;
      console.debug('Request to API:', { method, fullUrl, body, headers: requestHeaders });

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      let data: ApiResponse<T>;
      
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse API response:', error);
        throw new Error(`Ошибка при обработке ответа сервера: ${response.status}`);
      }

      if (!response.ok) {
        console.error('HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          data,
          headers: [...response.headers.entries()].reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {} as Record<string, string>),
        });

        if (response.status === 401) {
          // Ошибка аутентификации
          if (IS_DEV_MODE) {
            const errorMessage = data && typeof data === 'object' ? 
              (data as any).message || '401 Unauthorized' : 
              '401 Unauthorized';
            console.warn('⚠️ Режим разработки: проигнорирована ошибка авторизации', errorMessage);
            
            // В режиме разработки возвращаем мок-данные для всех типов запросов
            if (endpoint === '/profile') {
              return mockProfile() as unknown as T;
            } else if (endpoint === '/orders' || endpoint.startsWith('/orders?')) {
              return mockOrders() as unknown as T;
            } else if (endpoint.match(/\/orders\/[\w-]+$/)) {
              return mockOrderDetails() as unknown as T;
            }
            
            // Для других эндпоинтов создаем пустой ответ
            return {} as unknown as T;
          }
          
          throw new Error('Ошибка авторизации. Попробуйте перезапустить приложение в Telegram.');
        } else if (response.status === 404) {
          // В режиме разработки возвращаем имитацию данных для определенных точек API
          if (IS_DEV_MODE) {
            console.warn(`Dev mode: имитация данных для ${endpoint} из-за 404 ошибки`);
            
            // Имитация данных для различных эндпоинтов
            if (endpoint === '/orders' || endpoint.startsWith('/orders?')) {
              return mockOrders() as unknown as T;
            } else if (endpoint.match(/\/orders\/[\w-]+$/)) {
              return mockOrderDetails() as unknown as T;
            } else if (endpoint === '/profile') {
              return mockProfile() as unknown as T;
            }
          }
          
          throw new Error(`API не найден: ${endpoint}`);
        } else {
          throw new Error(data.error || `Ошибка сервера: ${response.status}`);
        }
      }

      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      // В режиме разработки имитируем данные для определенных API-эндпоинтов
      if (IS_DEV_MODE) {
        if (endpoint === '/profile') {
          console.warn('Dev mode: возвращаем тестовый профиль');
          return mockProfile() as unknown as T;
        } else if (endpoint === '/orders' || endpoint.startsWith('/orders?')) {
          console.warn('Dev mode: возвращаем тестовые заказы');
          return mockOrders() as unknown as T;
        } else if (endpoint.match(/\/orders\/[\w-]+$/)) {
          console.warn('Dev mode: возвращаем детали тестового заказа');
          return mockOrderDetails() as unknown as T;
        }
      }
      throw error instanceof Error ? error : new Error('Неизвестная ошибка');
    }
  };
};

/** Создание заказа */
export interface CreateOrderDTO {
  /** Адрес отправления */
  fromAddress: string;
  /** Адрес назначения */
  toAddress: string;
  /** Цена */
  price?: number;
  /** Комментарий */
  comment?: string;
}

/** Создание предложения цены */
export interface CreateOfferDTO {
  /** ID заказа */
  orderId: string;
  /** Цена */
  price: number;
}

/** Обновление заказа */
export interface UpdateOrderDTO {
  /** Статус заказа */
  status?: OrderStatus;
  /** Финальная цена */
  finalPrice?: number;
  /** ID водителя */
  driverId?: string;
  /** Время начала поездки */
  startedAt?: string;
  /** Время завершения поездки */
  completedAt?: string;
}

/** Обновление профиля */
export interface UpdateProfileDTO {
  /** Роль пользователя */
  role: 'driver' | 'passenger';
}

const http = createHttp();

/** API клиент */
// Функции для создания тестовых данных в режиме разработки
function mockProfile() {
  return {
    id: 'test-user-id',
    username: 'test_user',
    telegramId: '123456789',
    role: 'passenger',
    rating: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function mockOrders() {
  return [
    {
      id: 'order-1',
      fromAddress: 'ул. Абая, 47',
      toAddress: 'ТРЦ Мега',
      status: 'active',
      price: 2000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passengerId: 'test-user-id'
    },
    {
      id: 'order-2',
      fromAddress: 'Парк Горького',
      toAddress: 'Аэропорт Алматы',
      status: 'active',
      price: 4500,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      passengerId: 'test-user-id'
    }
  ];
}

function mockOrderDetails() {
  return {
    id: 'order-1',
    fromAddress: 'ул. Абая, 47',
    toAddress: 'ТРЦ Мега',
    status: 'active',
    price: 2000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passengerId: 'test-user-id',
    offers: [],
    messages: []
  };
}

export const api = {
  // Профиль
  /** Получить профиль */
  getProfile: () => http<Profile>('/profile'),
  /** Обновить профиль */
  updateProfile: (data: UpdateProfileDTO) =>
    http<Profile>('/profile', { method: 'PUT', body: data }),

  // Заказы
  /** Получить список заказов */
  getOrders: (status?: OrderStatus) =>
    http<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  /** Получить заказ */
  getOrder: (id: string) => http<Order>(`/orders/${id}`),
  /** Создать заказ */
  createOrder: (data: CreateOrderDTO) =>
    http<Order>('/orders', { method: 'POST', body: data }),
  /** Обновить заказ */
  updateOrder: (id: string, data: UpdateOrderDTO) =>
    http<Order>(`/orders/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  /** Получить список предложений */
  getOffers: (orderId: string) =>
    http<PriceOffer[]>(`/orders/${orderId}/offers`),
  /** Создать предложение */
  createOffer: (data: CreateOfferDTO) =>
    http<PriceOffer>('/offers', { method: 'POST', body: data }),
  /** Обновить предложение */
  updateOffer: (id: string, data: { status: 'accepted' | 'rejected' }) =>
    http<PriceOffer>(`/offers/${id}`, { method: 'PUT', body: data }),

  // Чат
  /** Получить список сообщений */
  getMessages: (orderId: string) =>
    http<Message[]>(`/orders/${orderId}/messages`),
  /** Отправить сообщение */
  sendMessage: (orderId: string, text: string) =>
    http<Message>(`/orders/${orderId}/messages`, {
      method: 'POST',
      body: { text },
    }),
} as const;
