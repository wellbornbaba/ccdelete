import { create } from 'zustand';
import { TypeOfRide } from '@/types';
import { Ride,  SelectedRideCheckout } from '@/types/vehicle';

interface RideStore {
  typeOfRides: TypeOfRide[];
  setTypeOfRides: (data: TypeOfRide[]) => void;
  selectRide: SelectedRideCheckout | null;
  setSelectedRide: (data: SelectedRideCheckout | null) => void;
  rideDetail: Ride | null;
  setRideDetail: (data: Ride | null) => void;
  rideActiveDetail: Ride | null;
  setRideActiveDetail: (data: Ride | null) => void;
  logRideId: string | null;
  setLogRideId: (string: string | null) => void;
}

export const useRideStore = create<RideStore>((set) => ({
  typeOfRides: [],
  selectRide: null,
  rideDetail: null,
  rideActiveDetail: null,
  rideSearchSelectedData: null,
  logRideId: null,

  setLogRideId(data) {
    set({ logRideId: data });
  },
  setRideActiveDetail(data) {
    set({ rideActiveDetail: data });
  },
  setTypeOfRides: (data) => {
    set({ typeOfRides: data });
  },
  setSelectedRide(data) {
    set({ selectRide: data });
  },
  setRideDetail(data) {
    set({ rideDetail: data });
  },
}));
