import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';
import ProfileDriver from '@/components/ProfileDriver';
import ProfilePassenger from '@/components/ProfilePassenger';
import { useProfileStore } from '@/store/useProfileStore';
import { ScrollView } from 'react-native-gesture-handler';

const profile = () => {
  const colors = useThemeStore((state) => state.colors);
  const currentUser = useAuthStore((state) => state.user);
  const userProfileData = useProfileStore((state) => state.userProfileData);

  const user = userProfileData ? userProfileData : currentUser;
  if (!user) return router.back();

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Profile'} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {user.accountType === 'driver' ? (
          <ProfileDriver />
        ) : (
          <ProfilePassenger />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;
