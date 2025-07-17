import { useEffect } from 'react';
// import { useAuth, useUser } from '@clerk/clerk-expo';
import { useClerkAuthStore } from '@/store/useClerkAuthStore';
import { ClerkUser } from '@/types/auth';

export function useClerkAuth() {
  // const { isLoaded, isSignedIn, signOut: clerkSignOut } = useAuth();
  // const { user: clerkUser } = useUser();
  
  const {
    user,
    isLoading,
    error,
    setUser,
    setIsSignedIn,
    setIsLoaded,
    setError,
    signOut: storeSignOut,
  } = useClerkAuthStore();

  // Sync Clerk state with Zustand store
  // useEffect(() => {
  //   // setIsLoaded(isLoaded);
  //   // setIsSignedIn(isSignedIn);
    
  //   if (clerkUser) {
  //     const mappedUser: ClerkUser = {
  //       id: clerkUser.id,
  //       emailAddresses: clerkUser.emailAddresses.map(email => ({
  //         emailAddress: email.emailAddress,
  //         id: email.id,
  //       })),
  //       firstName: clerkUser.firstName,
  //       lastName: clerkUser.lastName,
  //       imageUrl: clerkUser.imageUrl,
  //       hasImage: clerkUser.hasImage,
  //       primaryEmailAddressId: clerkUser.primaryEmailAddressId,
  //       primaryPhoneNumberId: clerkUser.primaryPhoneNumberId,
  //       phoneNumbers: clerkUser.phoneNumbers.map(phone => ({
  //         phoneNumber: phone.phoneNumber,
  //         id: phone.id,
  //       })),
  //       externalAccounts: clerkUser.externalAccounts.map(account => ({
  //         provider: account.provider,
  //         providerUserId: account.providerUserId,
  //         emailAddress: account.emailAddress,
  //       })),
  //       createdAt: clerkUser.createdAt,
  //       updatedAt: clerkUser.updatedAt,
  //     };
  //     setUser(mappedUser);
  //   } else {
  //     setUser(null);
  //   }
  // }, [isLoaded, isSignedIn, clerkUser, setUser, setIsSignedIn, setIsLoaded]);

  // const signOut = async () => {
  //   try {
  //     await clerkSignOut();
  //     storeSignOut();
  //   } catch (error) {
  //     console.error('Sign out error:', error);
  //     setError('Failed to sign out');
  //   }
  // };

  return {
    // isLoaded,
    // isSignedIn,
    user,
    isLoading,
    error,
    // signOut,
    setError,
  };
}