import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import DriverWallet from '@/components/DriverWallet';
import RiderWallet from '@/components/RiderWallet';

const wallet = () => {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();

  return (
    <SafeAreaView
      className="px-4"
      style={{ backgroundColor: colors.background }}
    >
      {user?.accountType === 'driver' ? <DriverWallet /> : <RiderWallet />}
    </SafeAreaView>
  );
};

export default wallet;
