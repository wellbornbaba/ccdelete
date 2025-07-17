import { calculateDistance } from '@/utils';
import {
  accountTypeProps,
  ActiveRide,
  DriverStatistic,
  Earnings,
  FeedBack,
  genderProps,
  KYCJsonProps,
  KycStore,
  KYCVerification,
  LocationProps,
  PaymentMethod,
  PaymentMethodType,
  PaymentStatus,
  Ratings,
  RideLocation,
  RideStatus,
  TypeOfRide,
  User,
  UserBasic,
} from '.';

export type RideType =
  | 'CityToCity'
  | 'InterState'
  | 'NightRide'
  | 'TouristRide'
  | 'DeliveryRide'
  | null;
export type RideRequestStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'cancelled';

export interface ChatMessage {
  id?: string;
  rideRequestId?: string | null;
  rideid?: string | null;
  senderId: string;
  receiverId: string;
  message: string;
  seen?: boolean;
  createdAt: Date;

  ride?: Ride | null; // Assuming Ride is another interface
  rideRequest?: RideRequest | null; // Assuming RideRequest is another interface
}

export interface RideRequest {
  id?: string;
  rideid?: string | null;
  initiatorId: string;
  acceptedId?: string | null;
  initiatorRole: accountTypeProps; // Assuming AccountType is an enum with these values

  dest_lat: number;
  dest_lng: number;
  dest_address: string;

  pickup_lat?: number | null;
  pickup_lng?: number | null;
  pickup_address?: string | null;

  current_lat?: number | null;
  current_lng?: number | null;
  current_address?: string | null;
  shared_fare_price?: number | null;
  principal_ride_fee?: number | null;
  principal_ride_fare_max?: number | null;
  awaitTimeMins?: number | null;
  matchRadiusInKm: number; // default is 5

  type_of_ride?: RideType | null; // Assuming RideType is a defined enum or union type
  scheduledAt?: Date | null;
  expiresAt: Date;

  seats: number;
  seat_remain: number;
  dstatus: RideRequestStatus; // Assuming RideRequestStatus is a defined enum

  ride?: Ride | null; // Assuming Ride is another interface
  chatMessage: ChatMessage[]; // Assuming ChatMessage is another interface
  createdAt: Date;
  initiatorUser?: User;
  activeUsers?: string[];
}

export interface Ride {
  id: string;
  passengerid: string;
  driverid: string;
  origin_address: LocationProps;
  destination_address: LocationProps;
  type_of_ride: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethodType;
  ride_time: Date;
  shared_fare_price: number;
  principal_ride_fee: number;
  seat_remain: number;
  distance: number;
  dstatus: RideStatus | 'initiated';
  created_at: Date;
  pickup_location?: LocationProps;
  dest_lat?: number;
  dest_lng?: number;
  dest_address?: string;
  current_lat?: number;
  current_lng?: number;
  current_address?: string;
  distance_used?: number;
  distance_km?: number;
  averageSpeed?: number; // km/h
  maxSpeed?: number; // km/h
  fuelEfficiency?: number; // km/l
  carbonFootprint?: number; // kg CO2
  principal_ride_fare_max?: number;
  seats?: number;
  tip?: number;
  company_share?: number;
  driver_share?: number;
  scheduled_time?: Date;
  scheduled_date?: Date;
  scheduled_location?: any;
  passenger_rating?: number;
  driver_rating?: number;
  passenger_feedback?: number;
  driver_feedback?: number;
  totalrides?: number;

  activeRide?: ActiveRide[];
  ratings?: Ratings[];
  feedbacks?: FeedBack[];
  earnings?: Earnings[];
  rideHistory?: RideHistoryBasicProps[];
  rideLocation?: RideLocation[];
  user: User; // passenger
  driver?: User;
  driverStatistic?: DriverStatistic;
}

export interface rideBasicLog {
  id: string;
  rideid?: string;
  shared_fare_price?: number;
  principal_ride_fee?: number;
  pickup_location?: string;
  boarded_location?: string;
  current_location?: string;
  origin_address: string;
  destination_address: string;
  created_at: Date;
  dstatus: RideStatus;
}

export interface DriverUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  photoURL: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  accountType: 'driver' | 'passenger';
  walletBalance?: number;
  kycScore?: {
    status: 'verified' | 'pending' | 'unverified' | string;
  };
  driver?: {
    model?: string;
    interior_color?: string;
    plate_number?: string;
    front_car_url?: string;
    back_car_url?: string;
  };
  driverStatistic?: {
    starDistribution: {
      star: number;
      count: number;
    }[];
  };
}


export interface VehicleRegistrationData {
  // Basic Information
  make: string;
  model: string;
  year: string;
  plateNumber: string;
  vin: string;

  // Vehicle Details
  chasisNumber: string;
  exteriorColor: string;
  interiorColor: string;
  vehicleType: string;
  numberOfSeats: string;
  mileage: string;

  // Insurance & Ownership
  insurancePolicyNumber: string;
  ownerFullName: string;
  isRegistered: boolean;
}

export interface VehiclePhotos {
  frontView: UploadedFile | null;
  rearView: UploadedFile | null;
}

export interface VehicleDocuments {
  driversLicenseFront: UploadedFile | null;
  driversLicenseBack: UploadedFile | null;
  vehicleRegistration: UploadedFile | null;
  insuranceDocument: UploadedFile | null;
  inspectionReport: UploadedFile | null;
}

export interface UploadedFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export interface VehicleRegistrationSubmission {
  vehicleData: VehicleRegistrationData;
  photos: VehiclePhotos;
  documents: VehicleDocuments;
  userId: string;
}

export type VehicleRegistrationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'requires_additional_info';

export type DriverCarStatus =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'inprogress';

export interface VehicleRegistrationResponse {
  id: string;
  status: VehicleRegistrationStatus;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  vehicleData: VehicleRegistrationData;
}

export interface JoinDataProps {
  userid?: string;
  rideid?: string;
  rideType: string;
  destination_address: LocationProps;
  origin_address: LocationProps;
  current_address?: LocationProps;
  scheduleDate?: Date | null;
  scheduleTime?: string;
  scheduleNote?: string;
  device_name?: string;
  device_number?: string;
  ip?: string;
}

export interface SelectedRideCheckout {
  rideData?: Ride | null;
  selectedData: JoinDataProps;
}

export interface Driver {
  id: string;
  userid: string;
  model?: string;
  plate_number?: string;
  interior_color?: string;
  exterior_color?: string;
  seats?: number;
  chasis?: string;
  ac?: boolean;
  year?: string;
  registered?: string;
  onwers_fullname?: string;
  front_car_url?: string;
  back_car_url?: string;
  rating?: number;
  drivers_license?: string;
  vechicle_registration?: string;
  insurance?: string;
  date_updated?: Date;
  dstatus?: DriverCarStatus;

  user: User;
  bankDetails: DriverBankDetail[];
}

export interface DriverBankDetail {
  id: string;
  userid?: string;
  bank_name?: string;
  account_type?: string;
  account_name?: string;
  account_number?: string;
  approve?: boolean;
  dstatus?: boolean;

  driver?: Driver;
}

export interface RideHistoryBasicProps {
  id: string;
  rideid: string;
  userid: string;
  driverid: string;
  shared_fare_price?: number;
  boarded_location: LocationProps;
  current_location?: LocationProps;
  destination_address: LocationProps;
  seat?: number;
  account_type: accountTypeProps;
  payment_status: PaymentStatus;
  payment_method: PaymentMethodType;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  created_at?: Date;
  dstatus?: RideStatus;
  distance?: number;
  ride_time?: Date;
  device_name?: string;
  device_number?: string;
  ip?: string;
  refund?: boolean;
  updatedAt?: Date;

  user: UserBasic;
  ride: Ride;
}

export interface UserTrip {
  id?: string;
  firstName: string;
  photoURL: string;
}
export interface PassengerTrip {
  id?: string;
  current_location: LocationProps;
  dstatus: RideStatus;
  distance: number;
  user: UserTrip;
}
export interface TripMonitoringProps {
  passengers: PassengerTrip[];
  driver: {
    id?: string;
    current_address: string;
    current_lat: number;
    current_lng: number;
    dstatus: RideStatus;
    distance: number;
    seat_remain: number;
    seats: number;
    user: UserTrip;
  };
}

export const updateTripProgress = (
  trip: LocationProps,
  tripDestination: LocationProps,
  currentLocation: LocationProps,
) => {
  // Calculate progress based on distance to destination
  const totalDistance = calculateDistance(
    trip?.lat || 0,
    trip?.lng || 0,
    tripDestination?.lat || 0,
    tripDestination?.lat || 0,
  );

  const remainingDistance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    tripDestination?.lat || 0,
    tripDestination?.lat || 0,
  );

  const progress = Math.max(
    0,
    Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100),
  );
  return progress;
};
