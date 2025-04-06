import type { Order, OrderStatus, PriceOffer, Message } from '@/shared/types/api';
import WebApp from '@twa-dev/sdk';

const API_URL = import.meta.env.VITE_API_URL;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export const createHttp = () => {
  return async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Получаем initData из WebApp
    let initData = WebApp.initData;
    let user = WebApp.initDataUnsafe?.user;
    let attempts = 0;
    
    // Пробуем получить данные несколько раз
    while ((!initData || !user) && attempts < 3) {
      console.log(`Attempt ${attempts + 1} to get WebApp data...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      initData = WebApp.initData;
      user = WebApp.initDataUnsafe?.user;
      attempts++;
    }
    
    console.log('WebApp data:', { initData, user, attempts });
    
    if (!initData || !user) {
      console.warn('WebApp initData or user is empty after retries', { initData, user });
      throw new Error('Ошибка авторизации Telegram');
    }

    // Добавляем initData в заголовки, если они не были добавлены
    if (!headers['X-Telegram-Init-Data']) {
      requestHeaders['X-Telegram-Init-Data'] = initData;
    }
    console.log('Request:', { endpoint, method, initData, user });

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.error('HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 401) {
        throw new Error('Ошибка авторизации Telegram');
      }

      const error = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
      throw new Error(error.message || 'Что-то пошло не так');
    }

    return response.json();
  };
};

export interface CreateOrderDTO {
  fromAddress: string;
  toAddress: string;
  price?: number;
  comment?: string;
}

interface CreateOfferDTO {
  orderId: string;
  price: number;
}

interface UpdateOrderDTO {
  status?: OrderStatus;
  finalPrice?: number;
  driverId?: string;
  startedAt?: string;
  completedAt?: string;
}

interface UpdateProfileDTO {
  role: 'driver' | 'passenger';
}

const http = createHttp();

export const api = {
  // Профиль
  getProfile: () => http<{ role: 'driver' | 'passenger' | null }>('/profile'),
  updateProfile: (data: UpdateProfileDTO) => http<{ role: 'driver' | 'passenger' }>('/profile', { method: 'PUT', body: data }),

  // Заказы
  getOrders: (status?: OrderStatus) => http<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id: string) => http<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) => http<Order>('/orders', { method: 'POST', body: data }),
  updateOrder: (id: string, data: UpdateOrderDTO) => http<Order>(`/orders/${id}`, { method: 'PUT', body: data }),

  // Предложения цены
  getOffers: (orderId: string) => http<PriceOffer[]>(`/orders/${orderId}/offers`),
  createOffer: (data: CreateOfferDTO) => http<PriceOffer>('/offers', { method: 'POST', body: data }),
  updateOffer: (id: string, data: { status: 'accepted' | 'rejected' }) =>
    http<PriceOffer>(`/offers/${id}`, { method: 'PUT', body: data }),

  // Чат
  getMessages: (orderId: string) => http<Message[]>(`/orders/${orderId}/messages`),
  sendMessage: (orderId: string, text: string) =>
    http<Message>(`/orders/${orderId}/messages`, { method: 'POST', body: { text } }),
} as const;
