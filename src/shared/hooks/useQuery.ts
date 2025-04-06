import { useCallback } from 'react';
import { useQuery as useReactQuery, useMutation } from '@tanstack/react-query';
import { createHttp } from '@/shared/api/http';

/** Опции запроса */
interface QueryOptions<T = unknown> {
  /** Ключ запроса */
  key: string;
  /** Путь запроса */
  path: string;
  /** Параметры запроса */
  params?: Record<string, unknown>;
  /** Тело запроса */
  body?: T;
  /** Метод запроса */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Отключить запрос */
  enabled?: boolean;
}

/** Хук для работы с запросами */
export function useQuery<TData = unknown, TBody = unknown>({
  key,
  path,
  params,
  body,
  method = 'GET',
  enabled = true,
}: QueryOptions<TBody>) {
  const http = createHttp();

  /** Выполнить запрос */
  const request = useCallback(async () => {
    const response = await http<TData>(path, {
      method,
      body,
    });

    return response;
  }, [http, method, path, body]);

  /** Запрос */
  const query = useReactQuery<TData>({
    queryKey: [key, path, params, body],
    queryFn: request,
    enabled,
  });

  return query;
}

/** Хук для работы с мутациями */
export function useMutate<TData = unknown, TBody = unknown>({
  key,
  path,
  method = 'POST',
}: Omit<QueryOptions<TBody>, 'enabled'>) {
  const http = createHttp();

  /** Выполнить запрос */
  const request = useCallback(async (body: TBody) => {
    const response = await http<TData>(path, {
      method,
      body,
    });

    return response;
  }, [http, method, path]);

  /** Мутация */
  const mutation = useMutation<TData, Error, TBody>({
    mutationKey: [key, path],
    mutationFn: request,
  });

  return mutation;
}
