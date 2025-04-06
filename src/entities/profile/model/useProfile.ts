import { useQuery, useMutate } from '@/shared/hooks';
import type { Profile } from '@/shared/types/api';

/** Хук для работы с профилем */
export function useProfile() {
  /** Получить профиль */
  const profile = useQuery<Profile>({
    key: 'profile',
    path: '/profile',
  });

  /** Обновить профиль */
  const updateProfile = useMutate<Profile, { role: 'driver' | 'passenger' }>({
    key: 'updateProfile',
    path: '/profile',
    method: 'PUT',
  });

  return {
    profile,
    updateProfile,
  };
}
