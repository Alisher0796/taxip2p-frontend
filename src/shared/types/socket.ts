import type { Message, Order, PriceOffer } from './api';

export type SocketEvent = 
  | 'order:created'
  | 'order:updated'
  | 'order:deleted'
  | 'offer:created'
  | 'offer:updated'
  | 'offer:deleted'
  | 'message:created'
  | 'message:updated'
  | 'message:deleted';

export interface SocketOrderEvent {
  type: Extract<SocketEvent, `order:${string}`>;
  payload: Order;
}

export interface SocketOfferEvent {
  type: Extract<SocketEvent, `offer:${string}`>;
  payload: PriceOffer;
}

export interface SocketMessageEvent {
  type: Extract<SocketEvent, `message:${string}`>;
  payload: Message;
}

export type SocketData = SocketOrderEvent | SocketOfferEvent | SocketMessageEvent;

export interface SocketResponse<T = unknown> {
  event: string;
  data: T;
}
