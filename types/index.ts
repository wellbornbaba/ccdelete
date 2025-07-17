import { Driver, Ride, RideHistoryBasicProps, RideRequest } from './vehicle';

// User types
export type accountTypeProps = 'passenger' | 'driver';
export type genderProps = 'Fenale' | 'Male';
export type Userd = {
  id: string;
  phone: string;
  firstname: string;
  otpcode: number;
  email: string;
};
export interface RideCateProps {
  id?: string;
  name: string;
  title: string;
  description: string;
  min_amount: number;
  max_amount: number;
}

export declare interface pickerData {
  label: any;
  value: any;
}

export interface companyDataProps extends CompanyInfo {
  faq?: string[];
}

// Auth types
export interface AuthState {
  user: User | null;
}

// Ride types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type searchParamProps = {
  typeOfRidesName: string;
  from_address: LocationProps;
  to_address: LocationProps;
};

export interface LocationProps {
  id?: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface Passenger {
  id: string;
  displayName: string;
  photoURL?: string;
  contribution?: number;
}
export interface RideState {
  rides: Ride[];
  currentRide: Ride | null;
  isLoading: boolean;
  error: string | null;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  systemMode: 'light' | 'dark';
}

export type PaymentMethodType =
  | 'card'
  | 'paypal'
  | 'apple'
  | 'google'
  | 'balance'
  | 'paystack';
// Payment types
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  brand?: string;
  isDefault: boolean;
}

export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  gray: string;
  border: string;
  notification: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  default: string;
}
export interface LightColors extends Colors {
  background: string;
  card: string;
  gray: string;
  text: string;
  border: string;
}

export interface Gradients {
  primary: string[];
  secondary: string[];
  card: string[];
}

export interface ThemeStore extends ThemeState {
  colors: Colors;
  gradients: Gradients;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export interface DestinationProps {
  recent: Ride[];
  favorite: Ride[];
}

export enum VerificationID {
  drivers_license = 'drivers_license',
  national_identity_card = 'national_identity_card',
  international_passport = 'international_passport',
  voters_card = 'voters_card',
}

export type TransactionWalletStatus =
  | 'Successful'
  | 'Cancel'
  | 'Error'
  | 'Completed'
  | 'Failed';
export type TransactionWalletType =
  | 'Wallet Funding'
  | 'Trip Payment'
  | 'Widthrawed'
  | 'Refunded'
  | 'Cancel'
  | 'Rejected'
  | 'Reserved';

export type RideStatus =
  | 'initiated'
  | 'waiting'
  | 'scheduled'
  | 'active'
  | 'boarded'
  | 'arrived'
  | 'inprogress'
  | 'completed'
  | 'cancelled';
export type DriverStatus = 'active' | 'inactive' | 'pending' | 'banned';
export type ProofOfAddress = 'nepa_bill' | 'water_bill' | 'bank_statement';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ProfileStatus =
  | 'pending'
  | 'verified'
  | 'cancelled'
  | 'deleted'
  | 'unverified'
  | 'partially';

export interface SearchResProps {
  ride: Ride;
  user: User;
}

export interface QuickDestinationSearchProps {
  favorite: SearchResProps[];
  recent: SearchResProps[];
}

export interface KycStore {
  status: ProfileStatus;
  noVerified: number;
  score: number;
  tier: string;
  kyc?: {
    phone: boolean;
    government_id: {
      status: KYCty;
      isVerified: boolean;
    };
    selfie_verification: {
      status: KYCty;
      isVerified: boolean;
    };
    proof_address: {
      status: KYCty;
      isVerified: boolean;
    };
  };
}

export interface WalletCardProps {
  key?: string;
  amount: number;
  status: TransactionWalletStatus;
  fundType: TransactionWalletType;
  date: Date;
}

export interface TripPassenger {
  id: string;
  name: string;
  photo?: string;
  phone: string;
}

export interface TripCoordinate {
  latitude: number;
  longitude: number;
  address: string;
}

export interface TripData {
  id: string;
  passenger: TripPassenger;
  pickup: TripCoordinate;
  destination: TripCoordinate;
  fare: number;
  status: 'pending' | 'accepted' | 'pickup' | 'in_progress' | 'completed';
  estimatedDuration: number;
  distance: number;
}
export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type WeeklyEarning = {
  day: Weekday;
  amount: number;
};

export interface RatingStars {
  star: number;
  count: number;
}

export interface DriverStatistic {
  timeFrame: string;
  totalRequests: number;
  acceptedTrips: number;
  completedTrips: number;
  acceptanceRate: number;
  completionRate: number;
  avgRating: number;
  starDistribution: RatingStars[];
}
// INTERFACES
export interface UserBasic {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  accountType?: accountTypeProps;
  photoURL?: string;
  kycScore?: KycStore;
  isAvaliable?: boolean;
  verified?: boolean;
  walletBalance?: number;
  earnings?: number;
  totalRides?: number;
  gender?: genderProps;
  driver?: Driver;
  driverStatistic?: DriverStatistic;
}

export interface User extends UserBasic {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  gender?: genderProps;
  available_earnings?: number;
  password?: string;
  otpcode?: string;
  government_id?: VerificationID;
  proof_address?: ProofOfAddress;
  selfie_verification?: string;
  ratings?: number;
  trips?: number;
  dstatus?: DriverStatus;
  social?: any;
  createdAt?: Date;
  quickDestinationSearch?: QuickDestinationSearchProps;

  driver?: Driver;
  activeRide?: boolean;
  notifications?: Notification;
  settings?: Setting;
  userLocations?: LocationProps;
  favouriteDestinations?: DestinationProps;
  activeRideLog?: Ride;

  rideHistory?: RideHistoryBasicProps[];
  feedBacks?: FeedBack[];
  walletHistories?: WalletHistory[];
  passengerHistory?: Ride[];
  driverHistory?: Ride[];
  earningsRecords?: Earnings[];
  contacts?: Contacts[];
  friends?: Contacts[];
  sosAlerts?: SosContacts[];
  driverStatistic?: DriverStatistic;
  weekEarnings?: WeeklyEarning[];
  rideRequest?: RideRequest | null;
}

export interface ActiveRide {
  id: string;
  rideid: string;
  userid: string;
  created_at: Date;

  user: User;
  ride: Ride;
}

export interface RideLocation {
  id?: string;
  rideid?: string;
  userid?: string;
  ridehistory_id?: string;
  lat?: Number;
  lng?: Number;
  address?: string;
  ip?: string;
  speed?: number; // km/h
  heading?: number; // degrees
  accuracy?: number; // meters
  created_at?: Date;
}

export interface FeedBack {
  id: string;
  userid: string;
  rideid: string;
  feedback: string;
  created_at: Date;

  user: User;
  ride: Ride;
}

export interface Ratings {
  id: string;
  userid: string;
  rideid: string;
  rating: number;
  created_at: Date;

  user: User;
  ride: Ride;
}

export interface WalletHistory {
  id: string;
  userid: string;
  transactionId: string;
  payment_method?: string;
  amount: number;
  charge_fee?: number;
  description?: string;
  dstatus: string;
  created_at: Date;

  user: User;
}

export interface Earnings {
  id: string;
  userid: string;
  rideid: string;
  distance: number;
  principal_ride_fee: number;
  shared_ride_fee: number;
  driver_share: number;
  company_share: number;
  status: PaymentStatus;
  created_at: Date;

  user: User;
  ride: Ride;
}

export type KYCty =
  | 'partially'
  | 'verified'
  | 'rejected'
  | 'inprogress'
  | 'pending'
  | 'flagged';

export interface Contacts {
  id: string;
  userid: string;
  friend_userid: string;
  created_at: Date;
  user: User;
  friend: User;
}

export interface SosContacts {
  id: string;
  userid: string;
  rideid: string;
  email?: string;
  phone?: string;
  name?: string;
  relationship?: string;
  current_location?: any;
  created_at: Date;

  user: User;
}

export interface TypeOfRide {
  id: string;
  name: string;
  title: string;
  description?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface Notification {
  id: string;
  userid: string;
  push: boolean;
  email: boolean;
  sms: boolean;

  user: User;
}

export interface Setting {
  id: string;
  userid: string;
  biometric: boolean;
  twoFA: boolean;
  device?: string;
  profile_visible: boolean;
  activity_status: boolean;
  location_services: boolean;
  theme_mode: string;
  language: string;

  user: User;
}

export interface CompanyInfo {
  id?: string;
  email: string;
  phone: string;
  name?: string;
  logo?: string;
  driver_fee_mile?: number;
  driver_percentage?: number;
  geoapi_key?: string;
  smtp_host?: string;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  whatsapp?: string;
  instagram?: string;
  x?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  address?: string;
  about_us?: string;
  terms?: string;
  policy?: string;
  appVersion?: string;
}
export interface KYCJsonProps {
  status: KYCty;
  frontDoc: string;
  backDoc?: string;
  features?: any;
}

export interface KYCVerification {
  id?: string;
  userid?: string;
  email: Boolean;
  phone: Boolean;
  government_id: KYCJsonProps;
  proof_address: KYCJsonProps;
  selfie_verification: KYCJsonProps;

  user?: User;
}

export type ChatMessageProps = {
  id: string;
  text?: string;
  type: 'text' | 'image' | 'file';
  sender: 'me' | 'them';
  avatar?: string;
  uri?: string;
  timestamp: number;
};
