import { router, usePathname } from 'expo-router';
import { useEffect,  useState } from 'react';
import '../global.css';
import { LogBox, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import Toast, {
  ToastConfig,
  ToastConfigParams,
} from 'react-native-toast-message';
import { bgPrimarColor } from '@/utils/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { getLocally } from '@/utils/fetch';
import { Ionicons } from '@expo/vector-icons';
import { useRideStore } from '@/store/useRideStore';
import { User } from '@/types';
import BgLoading from '@/components/BgLoading';
import { useLanguageStore } from '@/store/useLanguageStore';
import DraggableTripMonitor from '@/components/ui/DraggableTripMonitor';
import { fetchAppInfo } from '@/utils/auth';
import { useTripWatcher } from '@/lib/TripWatcher';
import { Button } from '@/components/ui/Button';
// import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
// import { tokenCache } from '@/utils/auth';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// LogBox.ignoreLogs(['Clerk:']);

// const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// if (!publishableKey) {
//   throw new Error(
//     'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
//   );
// }

export default function RootLayout() {
  const { setUserBasic, setCompanyDatas, setHydrated, user, JWTtoken, isLoginAuth } = useAuthStore();
  const setTypeOfRides = useRideStore((s) => s.setTypeOfRides);
  const activeRideDetail = useRideStore((s) => s.rideActiveDetail);
  const { isAppLoading, language } = useLanguageStore();
  const [rideReQuestCounter, setRideReQuestCounter] = useState(0);
  
  const pathname = usePathname(); // e.g., "/ride/trip-monitoring"
  const pageName = pathname.split('/').filter(Boolean).pop();

  const [loaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.otf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

 // ✅ Call the WebSocket hook
  useTripWatcher(user, JWTtoken || "", setRideReQuestCounter);
  const enableTripTracking = user?.activeRide;
  console.log(enableTripTracking);
  
  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded) {
      const prepData = async () => {
        try {
          const userLogin: User = await getLocally('user');
          if (userLogin) {
            setUserBasic(userLogin);
          }
        } catch (error) {
          console.log('error ', error);
        } finally {
          setHydrated(true);
        }

        await fetchAppInfo(setCompanyDatas, setTypeOfRides);
      };

      // let fecth all users from the database 5 limit
      prepData();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Configure the toast (typically in your root component)
  const toastConfig: ToastConfig = {
    success: (params: ToastConfigParams<any>) => (
      <View
        style={{
          height: 60,
          width: '90%',
          backgroundColor: '#4BB543',
          padding: 16,
          borderRadius: 12,
          elevation: 5,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        className="shadow-md"
      >
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>
            {params.text1}
          </Text>
          {params?.props?.text2 && (
            <Text style={{ color: 'white', fontSize: 11, marginTop: 4 }}>
              {params.props.text2}
            </Text>
          )}
        </View>
      </View>
    ),
    error: (params: ToastConfigParams<any>) => (
      <View
        style={{
          height: '100%',
          width: '90%',
          padding: 16,
          borderRadius: 12,
          elevation: 5,
          flexDirection: 'row',
          alignItems: 'center',
          flexShrink: 1,
        }}
        className="shadow-md bg-red-500"
      >
        <Ionicons name="close-circle" size={24} color="white" />
        <View style={{ marginLeft: 0 }}>
          <Text
            style={{
              color: 'white',
              fontWeight: '300',
              fontSize: 11,
              flexWrap: 'wrap',
            }}
            className="w-full px-2"
          >
            {params.text1}
          </Text>
          {params?.props?.text2 && (
            <Text style={{ color: 'white', fontSize: 11, marginTop: 4 }}>
              {params.props.text2}
            </Text>
          )}
        </View>
      </View>
    ),
  };

  return (
    // <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <ClerkLoaded> */}

      {/* <Button title='Selfie'
      onPress={() => {}}
      /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(root)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} />
      {isAppLoading && <BgLoading popup={true} />}

      {isLoginAuth && user?.accountType === 'driver' && rideReQuestCounter && (
        <DraggableTripMonitor
          message={
            <View className="-top-5 justify-center items-center">
              <Text className="text-default-900 font-bold text-xs ">
                {rideReQuestCounter}
              </Text>
              <Text className="text-default-900 font-bold text-xs ">
                Request
              </Text>
            </View>
          }
          innerColor={'#b91c1c'}
          outerColor={'#f8717160'}
          onPress={() => router.push("/(root)/(modals)/view-ride")}
        />
      )}

      {isLoginAuth && activeRideDetail && pageName !== 'view-ride' && pageName !== 'chat' && (
        <DraggableTripMonitor
          message={
            <View className="-top-5 justify-center items-center">
              <Text className="text-default-900 font-bold text-xs ">Trip</Text>
              <Text className="text-default-900 font-bold text-xs ">
                monitor
              </Text>
            </View>
          }
          innerColor={bgPrimarColor}
          outerColor={'#22c55e60'}
          onPress={() => router.push("/(root)/(modals)/view-ride")}
        />
        // <TouchableOpacity
        //   className="absolute bottom-32 rounded-full w-20 h-20 p-1 right-4 z-50 justify-center items-center"
        //   onPress={() => router.push('/view-ride')}
        //   style={{
        //     backgroundColor: '#07657250',
        //   }}
        // >
        //   <BlinkingBeacon
        //     size={30}
        //     color="#22c55e60"
        //     pulseColor={bgPrimarColor}
        //     duration={800}
        //   />
        //   <View className="-top-5 justify-center items-center">
        //     <Text className="text-default-900 font-bold text-xs ">Trip</Text>
        //     <Text className="text-default-900 font-bold text-xs ">monitor</Text>
        //   </View>
        // </TouchableOpacity>
      )}
      {/* </ClerkLoaded> */}
    </GestureHandlerRootView>
    // </ClerkProvider>
  );
}
