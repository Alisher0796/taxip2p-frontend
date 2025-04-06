import type { Message, Order, PriceOffer } from './api';

/** Все возможные события сокета */
export type SocketEvent = 
  // Заказы
  | 'order:created'   // Создан новый заказ
  | 'order:updated'   // Обновлен заказ
  | 'order:deleted'   // Удален заказ
  // Предложения
  | 'offer:created'   // Создано новое предложение
  | 'offer:updated'   // Обновлено предложение
  | 'offer:deleted'   // Удалено предложение
  // Сообщения
  | 'message:created' // Создано новое сообщение
  | 'message:updated' // Обновлено сообщение
  | 'message:deleted'; // Удалено сообщение

/** Событие заказа */
export interface SocketOrderEvent {
  readonly type: Extract<SocketEvent, `order:${string}`>;
  readonly payload: Order;
}

/** Событие предложения цены */
export interface SocketOfferEvent {
  readonly type: Extract<SocketEvent, `offer:${string}`>;
  readonly payload: PriceOffer;
}

/** Событие сообщения */
export interface SocketMessageEvent {
  readonly type: Extract<SocketEvent, `message:${string}`>;
  readonly payload: Message;
}

/** Все возможные типы событий */
export type SocketData<T extends SocketEvent, P> = {
  readonly type: T;
  readonly payload: P;
};

/** Ответ от сокет-сервера */
export interface SocketResponse<T = unknown> {
  readonly event: string;
  readonly data: T;
}
