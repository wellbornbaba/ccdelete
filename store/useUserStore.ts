import { create } from 'zustand';
import { User, AuthState } from '@/types';

interface UserStore extends AuthState {
  setUser: (data: User|null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: async (data) => {
    set({ user: data });
  },

}));