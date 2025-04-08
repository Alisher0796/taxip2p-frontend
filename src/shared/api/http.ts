import type { Order, OrderStatus, PriceOffer, Message, Profile } from '@/shared/types/api';

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
      // Проверяем доступность Telegram WebApp
      if (!window.Telegram?.WebApp) {
        if (IS_DEV_MODE) {
          console.warn('Dev mode: продолжаем без Telegram WebApp');
        } else {
          throw new Error('Telegram WebApp недоступен');
        }
      } else {
        const webApp = window.Telegram.WebApp;
        
        // Проверяем наличие данных инициализации
        if (webApp?.initData && webApp?.initDataUnsafe?.user) {
          const { initData } = webApp;
          requestHeaders['x-telegram-init-data'] = initData;
          console.debug('Telegram auth data added to request');
        } else {
          console.warn('Telegram WebApp данные отсутствуют:', { 
            initData: webApp?.initData,
            user: webApp?.initDataUnsafe?.user 
          });
          
          if (!IS_DEV_MODE) {
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
          url: response.url,
          data,
        });

        if (response.status === 401) {
          // Ошибка аутентификации
          throw new Error('Ошибка авторизации. Попробуйте перезапустить приложение в Telegram.');
        } else if (response.status === 404) {
          throw new Error(`API не найден: ${endpoint}`);
        } else {
          throw new Error(data.error || `Ошибка сервера: ${response.status}`);
        }
      }

      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      if (IS_DEV_MODE && endpoint === '/profile') {
        console.warn('Dev mode: возвращаем тестовый профиль');
        return {
          id: 'test-user-id',
          username: 'test_user',
          telegramId: '123456789',
          role: 'passenger',
          rating: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as unknown as T;
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
