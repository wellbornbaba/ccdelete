import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClerkUser, AuthState } from '@/types/auth';

interface ClerkAuthStore extends AuthState {
  setUser: (user: ClerkUser | null) => void;
  setIsSignedIn: (isSignedIn: boolean) => void;
  setIsLoaded: (isLoaded: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
  reset: () => void;
}

const initialState: AuthState = {
  isLoaded: false,
  isSignedIn: false,
  user: null,
  isLoading: false,
  error: null,
};

export const useClerkAuthStore = create<ClerkAuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => {
        set({ user, isSignedIn: !!user, error: null });
      },
      
      setIsSignedIn: (isSignedIn) => {
        set({ isSignedIn });
      },
      
      setIsLoaded: (isLoaded) => {
        set({ isLoaded });
      },
      
      setIsLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setError: (error) => {
        set({ error, isLoading: false });
      },
      
      signOut: () => {
        set({
          user: null,
          isSignedIn: false,
          error: null,
          isLoading: false,
        });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'clerk-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isSignedIn: state.isSignedIn,
      }),
    }
  )
);