export interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  hasImage: boolean;
  primaryEmailAddressId: string | null;
  primaryPhoneNumberId: string | null;
  phoneNumbers: Array<{
    phoneNumber: string;
    id: string;
  }>;
  externalAccounts: Array<{
    provider: string;
    providerUserId: string;
    emailAddress: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: ClerkUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface SocialAuthProvider {
  name: 'google' | 'facebook' | 'apple';
  displayName: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface AuthError {
  code: string;
  message: string;
  longMessage?: string;
}