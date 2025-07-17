import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { AxiosGet, getAPI, NAIRA, postAPI } from '@/utils/fetch';
import {
  formatCurrency,
  formatLocation,
  getDeviceDetails,
  getLocationByDefault,
} from '@/utils';
import { format, formatDate } from 'date-fns';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import {
  LocationProps,
  PaymentMethodType,
  SearchResProps,
  TypeOfRide,
} from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@/components/ui/Button';
import BgLoading from '@/components/BgLoading';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import debounce from 'lodash.debounce'; // install with: npm i lodash.debounce
import { useRideStore } from '@/store/useRideStore';
import Toast from 'react-native-toast-message';
import RideCateCard from '@/components/ui/RideCateCard';
import { Card } from '@/components/ui/Card';
import { openURL } from 'expo-linking';
import CustomBottomSheet from '@/components/CustomBottomSheet';
import { KeyBoardViewArea } from '@/components/ui/KeyBoardViewArea';
import { RideRequest } from '@/types/vehicle';
import { useLanguageStore } from '@/store/useLanguageStore';
import { fetchAddressLngLat } from '@/utils/auth';
import RideRequestResullt from '@/components/RideRequestResullt';
import { bgPrimarColor } from '@/utils/colors';

type favoriteProp = 'done' | 'loading' | '';
const timeFilters = ['Now', 'Today', 'Tomorrow', 'This week', 'Custom'];
const addressInit = {
  lat: 0,
  lng: 0,
  address: '',
};
const userStoresData = () => {
  const user = useAuthStore((state) => state.user);
  const companyDatas = useAuthStore((state) => state.companyDatas);
  const JWTtoken = useAuthStore((state) => state.JWTtoken);
  return {
    user,
    companyDatas,
    JWTtoken,
  };
};

const RideCategory = () => {
  const { colors } = useThemeStore();
  const { companyDatas, user, JWTtoken } = userStoresData();
  const { typeOfRides, setSelectedRide, setRideDetail } = useRideStore();
  const setIsAppLoading = useLanguageStore((s) => s.setIsAppLoading);
  const [selected, setSelected] = useState<string>('');
  const [categories, setCategories] = useState<TypeOfRide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [origin, setOrigin] = useState<LocationProps>(addressInit);
  const [destination, setDestination] = useState<LocationProps>(addressInit);
  const [inputFocus, setInputFocuse] = useState<'origin' | 'dest'>('origin');
  const [suggestions, setSuggestions] = useState<LocationProps[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinInputText, setPinInputText] = useState(true);
  const [favorite, setFavorite] = useState<favoriteProp>('');
  const GEOAPI_KEY =
    companyDatas?.geoapi_key || '0d2310b2c69149c3a4b1be11fcb0c2b6';
  const [showResult, setShowResult] = useState(false);
  const [searchRideResData, setSearchRideResData] = useState<
    RideRequest[] | null
  >(null);
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [fromDate, setInFromDate] = useState<Date | null>(null);
  const [fromTime, setInFromTime] = useState('00:00');
  const [fromNote, setInFromNote] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [createNewRide, setCreateNewRide] = useState(false);
  const [preViewDetailRideRequest, setPreViewDetailRideRequest] =
    useState<RideRequest | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setOrigin({ ...origin, address: 'Detecting location...' });
        const location = await getLocationByDefault();
        if (location && location.address) {
          setOrigin({
            lat: location.lat,
            lng: location.lng,
            address: formatLocation(location.address),
          });
        }
      } catch (error) {
        console.log(`Location error: ${error}`);
      } finally {
        setPinInputText(false);
      }
    };

    if (pinInputText) {
      fetchLocation();
    }
  }, [pinInputText, setPinInputText]);

  useEffect(() => {
    const getHandleCate = async () => {
      if (typeOfRides && typeOfRides.length > 0) {
        setSuggestions(null);
        setCategories(typeOfRides);
        setIsLoading(true);
        return;
      }

      try {
        const getcate = await getAPI('/api/auth/ride-category');

        setCategories(getcate.data || []);
      } catch (error) {
        console.log(`Error: ${error}`);
      } finally {
        setIsLoading(true);
        setRefresh(false);
      }
    };

    if (refresh) {
      getHandleCate();
    }
  }, [refresh, setRefresh]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (showPicker === 'date') {
        setInFromDate(selectedDate);
      } else {
        setInFromTime(format(selectedDate, 'hh:mm a'));
      }
    }
    setShowPicker(null);
  };

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (text.length < 3) {
        setSuggestions([]);
        return;
      }
      setFavorite('');

      try {
        setLoading(true);
        const result = await fetchAddressLngLat(text, GEOAPI_KEY);
        setSuggestions(result);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setLoading(false);
      }
    },
    [GEOAPI_KEY],
  );

  // Inside your component:
  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 500),
    [],
  );

  const handleOriginChange = (text: string) => {
    setOrigin({ ...origin, address: text });
    if (!text) {
      setSuggestions(null);
      debouncedFetchSuggestions('');
    } else {
      debouncedFetchSuggestions(text);
    }
  };

  const handleDestChange = (text: string) => {
    setDestination({ ...destination, address: text });
    if (!text) {
      setSuggestions(null);
      debouncedFetchSuggestions('');
    } else {
      debouncedFetchSuggestions(text);
    }
  };

  const handleAddDestinationAddr = async () => {
    Keyboard.dismiss();
    if (!destination.address) {
      Toast.show({
        type: 'error',
        text1: 'Destination address is required ',
      });
      return;
    }

    let addrParam = {
      userid: user?.id,
      lat: destination.lat,
      lng: destination.lng,
      address: destination.address,
    };

    if (destination.address && !destination.lat) {
      const getAddLatitudes: any = await fetchSuggestions(destination.address);
      if (getAddLatitudes && getAddLatitudes?.lat) {
        setDestination(getAddLatitudes);
        addrParam = {
          ...addrParam,
          lat: destination.lat,
          lng: destination.lng,
        };
      }
    }

    try {
      setFavorite('loading');
      const addressRes = await postAPI(
        `/api/users/${user?.id}/addfavoriteAddr`,
        addrParam,
        'POST',
        JWTtoken || '',
      );

      if (addressRes?.success) {
        Toast.show({
          type: 'success',
          text1: 'Destination address added to favorite',
        });
        setFavorite('done');
        return;
      }

      Toast.show({
        type: 'error',
        text1: addressRes.message,
      });
      setFavorite('');
      return;
    } catch (error) {
      console.log(error);

      Toast.show({
        type: 'error',
        text1: 'Error failed  ',
      });

      setFavorite('');
    }
  };

  const handleSelectAddr = (item: any) => {
    Keyboard.dismiss();
    setSuggestions(null);
    inputFocus === 'origin' ? setOrigin(item) : setDestination(item);
  };

  const handleCreateNewRide = async () => {
    console.log('create new ride');
  };
  const handleCancel = () => {
    setIsVisible(false);
    reset();
  };

  const handleContinue = async (save: boolean = false) => {
    setSuggestions(null);

    if ((save && !fromDate) || !fromTime) {
      Toast.show({
        type: 'error',
        text1: 'Please select date and time to proceed',
      });
      return;
    }

    const searchParams = {
      typeOfRidesName: selected,
      from_address: origin,
      to_address: destination,
    };

    setIsVisible(false);
    setIsAppLoading(true);
    try {
      const rideRes = await postAPI(
        `/api/ride-request/${user?.id}/searchride`,
        searchParams,
        'POST',
        JWTtoken || '',
      );

      if (rideRes.success) {
        if (!rideRes.data.rides.length) {
          // reset();
          setCreateNewRide(true);
          setIsVisible(true);
          return;
        }
        setSearchRideResData(rideRes.data.rides);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Oop! server busy, try again',
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAppLoading(false);
      setShowResult(true);
    }
  };

  const handlePickDestination = () => {
    setSuggestions(null);
    router.push('/(root)/(modals)/add-address');
    console.log('picked destination');
  };

  const handleRePin = () => {
    setSuggestions(null);
    setPinInputText(true);
    setSearchRideResData(null);
    setShowResult(false);
  };

  const handleRefresh = () => {
    reset();
    setRefresh(true);
  };

  const reset = () => {
    setPinInputText(true);
    setOrigin({ ...origin, address: '' });
    setDestination({ ...destination, address: '' });
    setShowResult(false);
    setSearchRideResData(null);
    setSelected('');
    setFavorite('');
    setIsBtnLoading(false);
    setCreateNewRide(false);
  };

  const handlePayDetail = (item: RideRequest) => {
    setPreViewDetailRideRequest(item);
    setIsVisible(true);
  };

  const payNowHandler = async (type: PaymentMethodType) => {
    const vitalDetail = await getDeviceDetails();

    const searchParams = {
      paymenttype: type,
      rideRequestId: preViewDetailRideRequest?.id,
      userid: user?.id,
      amount: preViewDetailRideRequest?.shared_fare_price,
      current_lat: origin.lat,
      current_lng: origin.lng,
      current_address: origin.address,
      device_name: vitalDetail.devicename,
      device_number: vitalDetail.deviceid,
      ip: vitalDetail.ip,
    };

    if (type === 'paystack') {
      Toast.show({
        type: 'info',
        text1: `${type} payment gateway is busy at the moment, use another`,
      });

      return;
    }

    setIsVisible(false);
    setIsAppLoading(true);
    try {
      const rideRes = await postAPI(
        `/api/ride-request/${user?.id}/pay`,
        searchParams,
        'POST',
        JWTtoken || '',
      );

      if (rideRes.success) {
        if (!rideRes.data.rides.length) {
          // reset();
          setCreateNewRide(true);
          setIsVisible(true);
          return;
        }
        setSearchRideResData(rideRes.data.rides);
        Toast.show({
          type: 'success',
          text1: 'Thanks your payment was successful',
        });

        router.navigate('/(root)/ride-detail');
      } else {
        Toast.show({
          type: 'info',
          text1: rideRes.message || 'Oop! Payment processing failed, try again',
        });
        setIsVisible(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAppLoading(false);
      setShowResult(true);
    }
  };

  const handlePay = (type: PaymentMethodType) => {
    const balance = Number(user?.walletBalance);
    const amount = Number(preViewDetailRideRequest?.shared_fare_price);

    if (type === 'balance' && balance < amount) {
      Toast.show({
        type: 'error',
        text1: 'Insuffients balance, kindly use another payment method',
      });
      return;
    }
    // confirm first
    Alert.alert(
      'Paymant Review',
      `You are about to make payment of ${NAIRA}${formatCurrency(amount)}  to join this ride, do you want to proceed?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes Continue',
          style: 'destructive',
          onPress: () => payNowHandler(type),
        },
      ],
    );
  };

  return (
    <>
      <SafeAreaView
        className="flex-1 px-4 mb-4"
        style={{ backgroundColor: colors.background }}
        onTouchMove={() => setSuggestions(null)}
      >
        {(!isLoading || isBtnLoading) && (
          <BgLoading
            popup={true}
            title={isBtnLoading ? 'Searching for drivers...' : ''}
          />
        )}
        {favorite === 'loading' && <BgLoading popup={true} />}
        <DashboardPagesHeader
          onBack={true}
          centerElement={'Find Ride'}
          rightElement={
            <TouchableOpacity onPress={handleRefresh} className="mr-2">
              <Feather name="refresh-cw" size={20} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-4 flex-1">
            <Input
              value={origin.address || ''}
              onChangeText={handleOriginChange}
              placeholder="Enter pickup location"
              classStyle="flex-1 "
              style={{ marginBottom: 4 }}
              inputStyle={{ fontSize: 14, height: 45 }}
              ViewStyle={{ padding: 5, backgroundColor: '#F9FAFB' }}
              icon={
                <TouchableOpacity onPress={handleRePin}>
                  <Feather name="map-pin" size={20} color={'#07657270'} />
                </TouchableOpacity>
              }
              onFocus={() => setInputFocuse('origin')}
            />

            <View>
              <Input
                value={destination.address || ''}
                onChangeText={handleDestChange}
                placeholder="Enter destination"
                classStyle="flex-1"
                inputStyle={{ fontSize: 14, height: 45 }}
                ViewStyle={{ padding: 5, backgroundColor: '#F9FAFB' }}
                icon={
                  <TouchableOpacity onPress={handlePickDestination}>
                    <Feather name="map-pin" size={20} color={'#f8717170'} />
                  </TouchableOpacity>
                }
                onFocus={() => setInputFocuse('dest')}
              />
              <TouchableOpacity
                onPress={handleAddDestinationAddr}
                style={{ position: 'absolute', right: 16, top: 15 }}
              >
                <MaterialIcons
                  name={favorite === 'done' ? 'thumb-up' : 'favorite-border'}
                  size={24}
                  color={favorite === 'done' ? '#16a34a' : '#00000070'}
                />
              </TouchableOpacity>
            </View>
            {loading && (
              <Text className="text-sm text-gray-400 my-2 ">Searching...</Text>
            )}

            {suggestions && suggestions.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: inputFocus === 'origin' ? 50 : 110,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  zIndex: 1000,
                  borderRadius: 8,
                  paddingVertical: 4,
                  shadowColor: '#000',
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ paddingVertical: 12, paddingHorizontal: 12 }}
                    onPress={() => handleSelectAddr(item)}
                    className="border-t border-t-gray-200 "
                  >
                    <Text className="text-sm text-gray-800 ">
                      {item.address}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {searchRideResData && searchRideResData.length > 0 ? (
            searchRideResData.map((item: RideRequest) => (
              <View key={item.id}>
                <Card classStyle="gap-5 mb-5">
                  <RideRequestResullt
                    item={item}
                    handlePayment={() => handlePayDetail(item)}
                  />
                </Card>
              </View>
            ))
          ) : (
            <>
              <Text
                style={{ color: colors.text }}
                className="font-['Inter-Bold'] text-lg mt-4"
              >
                Select Type of Ride
              </Text>

              {categories && categories.length > 0 ? (
                categories.map((cate, index) => (
                  <RideCateCard
                    cate={cate}
                    key={index}
                    selected={selected}
                    setSelected={() => {
                      Keyboard.dismiss();
                      setSuggestions(null);
                      setSelected(cate.name === selected ? '' : cate.name);
                    }}
                  />
                ))
              ) : (
                <Text className="justify-center items-center text-sm">
                  No Categories
                </Text>
              )}
            </>
          )}
        </ScrollView>
        {/* <View className="absolute top-0 right-0 left-0 bg-black/40" /> */}
        {!searchRideResData && (
          <Button
            title="Find Ride Now"
            isLoading={isBtnLoading}
            disabled={
              selected && origin.address && destination.address ? false : true
            }
            onPress={() => setIsVisible(true)}
            icon={<FontAwesome5 name="check-circle" size={18} color="#fff" />}
            classStyle=" bottom-2"
          />
        )}
      </SafeAreaView>
      <CustomBottomSheet
        isVisible={isVisible}
        onClose={() => {
          Keyboard.dismiss();
          // reset();
          // setIsVisible(false);
        }}
        mainClass="h-[40%] w-full"
      >
        <KeyBoardViewArea
          useScroll={true}
          scrollViewProps={{
            showsHorizontalScrollIndicator: false,
            showsVerticalScrollIndicator: false,
          }}
        >
          {preViewDetailRideRequest ? (
            <>
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-['Inter-Bold'] mb-2">
                  Make Payment
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPreViewDetailRideRequest(null);
                    setIsVisible(false);
                  }}
                >
                  <MaterialIcons name="close" size={28} color={bgPrimarColor} />
                </TouchableOpacity>
              </View>
              <View className="justify-center my-6 items-center gap-2">
                <Text className="text-xl text-green-700">
                  you have {NAIRA}
                  {formatCurrency(user?.walletBalance || 0)} balance
                </Text>
              </View>
              {/* Buttons */}
              <View className="flex-row justify-between mt-4">
                <Pressable
                  onPress={() => handlePay('balance')}
                  className="border border-teal-700 px-4 py-3 rounded-xl flex-1 mr-2"
                >
                  <Text className="text-teal-700 text-center font-semibold">
                    Pay with Balance
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handlePay('paystack')}
                  className="bg-teal-700 px-4 py-3 rounded-xl flex-1 ml-2"
                >
                  <Text className="text-white text-center font-semibold">
                    Pay with PayStack
                  </Text>
                </Pressable>
              </View>
            </>
          ) : createNewRide ? (
            <>
              <Text className="text-xl font-['Inter-Bold'] mb-2">
                Search Result
              </Text>
              <View className="justify-center my-4 items-center gap-2">
                <Text className="text-xl font-['Inter-SemiBold'] text-red-600">
                  Sorry no match found
                </Text>
                <Text className="text-sm text-green-700">
                  Would you like to create a new ride and wait for driver to
                  accept?
                </Text>
              </View>
              {/* Buttons */}
              <View className="flex-row justify-between mt-4">
                <Pressable
                  onPress={handleCancel}
                  className="border border-teal-700 px-4 py-3 rounded-xl flex-1 mr-2"
                >
                  <Text className="text-teal-700 text-center font-semibold">
                    No
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateNewRide}
                  className="bg-teal-700 px-4 py-3 rounded-xl flex-1 ml-2"
                >
                  <Text className="text-white text-center font-semibold">
                    Yes continue
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text className="text-xl font-['Inter-Bold'] mb-2">Schedule</Text>

              <View className="flex-row gap-2 mb-3">
                <Pressable
                  onPress={() => setShowPicker('date')}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-3 flex-row items-center gap-2"
                >
                  <Feather name="calendar" size={16} color="gray" />
                  <Text className="text-gray-500">
                    {fromDate ? format(fromDate, 'yyyy-MM-dd') : 'Date'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowPicker('time')}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-3 flex-row items-center gap-2"
                >
                  <Feather name="clock" size={16} color="gray" />
                  <Text className="text-gray-500">{fromTime}</Text>
                </Pressable>
              </View>

              <TextInput
                placeholder="Add a note (Optional)"
                className="border border-gray-300 p-3 rounded-md mb-6"
                multiline
                numberOfLines={2}
              />

              {/* Buttons */}
              <View className="flex-row justify-between mt-4">
                <Pressable
                  onPress={() => handleContinue(true)}
                  className="border border-teal-700 px-4 py-3 rounded-xl flex-1 mr-2"
                >
                  <Text className="text-teal-700 text-center font-semibold">
                    Save & Continue
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleContinue(false)}
                  className="bg-teal-700 px-4 py-3 rounded-xl flex-1 ml-2"
                >
                  <Text className="text-white text-center font-semibold">
                    Skip Book Now
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </KeyBoardViewArea>

        {showPicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode={showPicker}
            display="inline"
            onChange={handleDateChange}
          />
        )}
      </CustomBottomSheet>
    </>
  );
};

export default RideCategory;
