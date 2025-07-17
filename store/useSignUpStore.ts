// stores/useSignUpStore.ts
import { Userd } from '@/types';
import { create } from 'zustand';

interface SignUpStore {
  userSignUpData: Userd | null,
  setUserSignUpData: (data: Userd | null) => void;
}

export const useSignUpStore = create<SignUpStore>((set) => ({
  userSignUpData: null,
  setUserSignUpData: (data) => {
    set({userSignUpData: data})
  }
  
}))
