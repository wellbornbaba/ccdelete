import { useAuthStore } from '@/store/useAuthStore';
// import { useClerkAuth } from "@/hooks/useClerkAuth";
import { getLocally } from '@/utils/fetch';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import BgLoading from '@/components/BgLoading';

const driverAttension = ['pending', 'rejected'];

export default function Page() {
  const { isHydrated, setUser, setUserBasic, user, isLoginAuth } =
    useAuthStore();
  // const { isLoaded, isSignedIn, user: clerkUser } = useClerkAuth();
  const [userLocal, setLocalUser] = useState<User | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const checkUser = async () => {
      // Check onboarding status
      const hasSeen = await getLocally('hasSeenOnboarding');
      setHasSeenOnboarding(!!hasSeen);

      // Check legacy user
      const userLogin = await getLocally('user');
      if (userLogin) {
        setLocalUser(userLogin);
        setUserBasic(userLogin);
      }
    };
    checkUser();
  }, [setUserBasic, setUser]);

  // Wait for all auth systems to load
  // if (!isLoaded || !isHydrated || hasSeenOnboarding === null) {
  //   return <BgLoading />
  // }
  // return <Redirect href="/onboarding" />;

  if (!isHydrated || hasSeenOnboarding === null) {
    return <BgLoading />;
  }

  // Clerk authentication takes precedence
  // if (isSignedIn && clerkUser) {
  //   return <Redirect href="/(root)/(tabs)" />;
  // }

  // return <BgLoading />
  // Legacy authentication
  if (user || userLocal) {
    if (isLoginAuth && user) {
      if (user.kycScore?.status !== 'verified') {
        return <Redirect href="/(root)/verification-status" />;
      }
      if (user.accountType === 'driver' &&
        driverAttension.includes(user.driver?.dstatus || 'pending')
      ) {
        return <Redirect href="/(root)/driver-form" />;
      }

      return <Redirect href="/(root)/(tabs)" />;
    }
    return <Redirect href="/(auth)/login-lock" />;
  }

  // Onboarding flow
  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Default to auth
  return <Redirect href="/(auth)" />;
}
