export type AppRoute = 
  | '/'
  | '/role'
  | '/driver'
  | '/driver/active'
  | '/passenger'
  | '/passenger/active';

export interface RouteParams {
  id?: string;
}

export type RouteWithParams<T extends AppRoute> = T extends `${string}:${string}`
  ? never
  : T;
