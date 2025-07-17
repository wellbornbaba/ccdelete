import { User, UserBasic } from '@/types';
import { create } from 'zustand';

interface ProfileStore {
  userProfileData: User | null;
  setUserProfileData: (data: User | null) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  userProfileData: null,
  setUserProfileData: (data) => {
    set({ userProfileData: data });
  },
}));
