import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Role } from '@/shared/types/common';

interface UserState {
  user: User | null;
  role: Role | null;
  setUser: (user: User) => void;
  setRole: (role: Role) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        role: null,
        setUser: (user) => set({ user }),
        setRole: (role) => set({ role }),
        reset: () => set({ user: null, role: null }),
      }),
      {
        name: 'user-storage',
      }
    )
  )
);
