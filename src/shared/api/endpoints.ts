export const API_ENDPOINTS = {
  PROFILE: '/profile',
  ORDERS: '/orders',
  OFFERS: '/offers',
  MESSAGES: '/messages',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
