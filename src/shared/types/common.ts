export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type Role = 'passenger' | 'driver';

export interface Car {
  model: string;
  licensePlate: string;
}

export interface BaseUser {
  id: string;
  telegramId: string;
  username: string;
  role: Role | null;
  car?: Car;
}

export interface User extends BaseUser {
  createdAt: string;
  updatedAt: string;
}
