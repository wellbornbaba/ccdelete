import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState, companyDataProps, UserBasic } from '@/types';
import { storeLocally } from '@/utils/fetch';
import { router } from 'expo-router';
export interface GlobalProps {
  isLogin: boolean;
  user: User;
  userBasic: UserBasic;
  companyInfo: companyDataProps;
  token: string;
}

interface AuthStore extends AuthState {
  isLoginAuth: boolean;
  userBasic: UserBasic | null;
  setIsLoginAuth: (isLoginAuth: boolean) => void;
  signOut: () => Promise<void>;
  setUserBasic: (data: UserBasic | null) => void;
  setUser: (data: User | null) => void;
  companyDatas: companyDataProps | null;
  setCompanyDatas: (data: companyDataProps) => void;
  isHydrated: boolean; // ADD THIS
  setHydrated: (isHydrated: boolean) => void;
  JWTtoken: string | null; // Optional JWT token
  setJWTtoken: (token: string | null) => void; // Optional setter for JWT token
  setUpdateGlobal: (data: GlobalProps | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoginAuth: false,
  user: null,
  userBasic: null,
  companyDatas: null,
  isHydrated: false,
  JWTtoken: null,

  setUpdateGlobal(data) {
    set({
      isLoginAuth: data?.isLogin,
      user: data?.user,
      userBasic: data?.userBasic,
      companyDatas: data?.companyInfo,
    });
  },
  setUserBasic(data) {
    set({ userBasic: data });
  },
  setIsLoginAuth: (islogin) => {
    set({ isLoginAuth: islogin });
  },
  setJWTtoken: async (token) => {
    await storeLocally('JWTtoken', token);
    set({ JWTtoken: token });
  },

  setHydrated(data) {
    set({ isHydrated: data });
  },

  setCompanyDatas: async (data) => {
    await storeLocally('companyInfo', data);
    set({ companyDatas: data });
  },
  setUser: async (data) => {
    await storeLocally('user', {
      id: data?.id,
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.email,
      phoneNumber: data?.phoneNumber,
      photoURL: data?.photoURL,
      accountType: data?.accountType,
      verified: data?.verified,
    });
    set({ user: data, isLoginAuth: true });
  },

  signOut: async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('JWTtoken');
      set({ user: null, userBasic: null, isLoginAuth: false });
      router.replace('/(auth)');
    } catch (error) {
      throw error;
    }
  },
}));
