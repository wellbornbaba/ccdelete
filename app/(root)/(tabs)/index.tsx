import { useAuthStore } from '@/store/useAuthStore';
import Drivers from '@/components/Drivers';
import RidersDashboard from '@/components/Riders';
import { Redirect } from 'expo-router';
import BgLoading from '@/components/BgLoading';


export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isLoginAuth = useAuthStore((state) => state.isLoginAuth);
  
  if(!user) return <BgLoading />
  if(!isLoginAuth) return <Redirect href={"/(auth)"} />
  return user?.accountType ==="driver" ? <Drivers /> : <RidersDashboard />
}