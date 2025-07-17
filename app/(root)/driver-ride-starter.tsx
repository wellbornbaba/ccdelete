import { View, Text, TouchableOpacity, Keyboard } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/useThemeStore';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { LocationProps, pickerData, User } from '@/types';
import {
  calculateDistanceKm,
  formatCurrency,
  formatLocation,
  getLocationByDefault,
  InputAmountFormater,
  ZodChecker,
} from '@/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { FormKeyboardView } from '@/components/ui/FormKeyboardView';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Redirect, router } from 'expo-router';
import { AxiosGet, NAIRA, postAPI } from '@/utils/fetch';
import debounce from 'lodash.debounce';
import { SelectField } from '@/components/ui/SelectField';
import { RideType } from '@/types/vehicle';
import { useRideStore } from '@/store/useRideStore';
import { Feather, FontAwesome6 } from '@expo/vector-icons';
import {  fetchAppInfo } from '@/utils/auth';
import { AddressInputWithSuggestions } from '@/components/ui/AddressInputWithSuggestions';
import Toast from 'react-native-toast-message';
import CustomBottomSheet from '@/components/CustomBottomSheet';

const initDes = {
  lat: 0,
  lng: 0,
  address: '',
};
export default function DriverRideStarter() {
  const typeOfRides = useRideStore((s) => s.typeOfRides);
  const setTypeOfRides = useRideStore((s) => s.setTypeOfRides);

  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const companyDatas = useAuthStore((state) => state.companyDatas);
  const setCompanyDatas = useAuthStore((state) => state.setCompanyDatas);

  const JWTtoken = useAuthStore((state) => state.JWTtoken);
  const [origin, setOrigin] = useState<LocationProps>(initDes);
  const [destination, setDestination] = useState<LocationProps>(initDes);
  const [inputFocus, setInputFocuse] = useState<'origin' | 'dest'>('origin');
  const [loading, setLoading] = useState(false);
  const [pinInputText, setPinInputText] = useState(true);
  const [listOfRideTypes, setListOfRideTypes] = useState<pickerData[]>([]);
  const [rawAmount, setRawAmount] = useState('0');
  const [isVisible, setisVisible] = useState(false);
  const [rideMaxAmount, setRideMaxAmount] = useState(
    companyDatas?.driver_fee_mile ?? 100,
  );
  const [addressType, setAddressType] = useState<
    'dest_address' | 'pickup_address'
  >('dest_address');
  const GEOAPI_KEY =
    companyDatas?.geoapi_key || '0d2310b2c69149c3a4b1be11fcb0c2b6';
  if (!user) return <Redirect href={'/(root)/(tabs)'} />;

  const [form, setForm] = useState({
    amount: '0',
    initiatorId: user.id,
    accountType: user.accountType,
    pickup_address: '',
    pickup_lat: 0,
    pickup_lng: 0,
    dest_address: '',
    dest_lat: 0,
    dest_lng: 0,
    seats: 0,
    current_address: '',
    current_lat: 0,
    current_lng: 0,
    numberOfSeats: 2,
    principal_ride_fee: 0,
    shared_fare_price: 0,
    waitTimeMinutes: 0,
    scheduled_location: {},
    scheduled_at: null,
    type_of_ride: '',
    note: '',
    radius: 10,
  });

  useEffect(() => {
    if (!typeOfRides.length) {
      (async () => {
        try {
          await fetchAppInfo(setCompanyDatas, setTypeOfRides);
        } catch (err) {
          console.error('Failed to fetch app info', err);
        }
      })();
    }
  }, [typeOfRides]);

  useEffect(() => {
    const rideTypes = typeOfRides.map((type) => ({
      label: type.title,
      value: type.name,
    }));

    rideTypes.push({
      label: 'Any',
      value: '',
    });

    setListOfRideTypes(rideTypes.reverse());
  }, [setTypeOfRides, typeOfRides]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setOrigin({ ...origin, address: 'Detecting location...' });
        const location = await getLocationByDefault();
        if (location && location.address) {
          // handleInputChange("current_lat", String(location.lat))
          form.current_lat = location.lat;
          form.current_lng = location.lng;
          form.current_address = location.address;

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

  const handleInputChange = (
    name: keyof typeof form,
    value: string | boolean | number,
  ) => {
    if (name === 'pickup_address' || name === 'dest_address') {
      setAddressType(name);
    }

    if (name === 'amount') {
      const convertAmount = InputAmountFormater(String(value));
      if (Number(convertAmount.value) > rideMaxAmount) {
        Toast.show({
          type: 'error',
          text1: `Ooh sorry the amount must not exceed ${NAIRA}${formatCurrency(rideMaxAmount)}`,
        });

        return;
      }
      setRawAmount(String(convertAmount.value));
      setForm((prev) => ({
        ...prev,
        [name]: String(convertAmount.valueConverted),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calculateMaxAmount = (item: LocationProps) => {
    if(!form.dest_lat && !form.pickup_lat) return null;
    const pickUpLocation: LocationProps ={
      address: form.pickup_address ?? "",
      lat: form.pickup_lat ?? 0,
      lng: form.pickup_lng ?? 9,
    }
    const distance = calculateDistanceKm(pickUpLocation, item);
    const maxAmount = distance * Number(companyDatas?.driver_fee_mile);
    setRideMaxAmount(maxAmount);
  };

  const handleSelectAddr = (item: LocationProps) => {
    Keyboard.dismiss();
    setisVisible(false);
    if (!addressType) return;
    handleInputChange(addressType, item?.address ?? '');
    if (addressType === 'dest_address' || addressType === 'pickup_address') {
      // calculate max amount
     calculateMaxAmount(item);
      handleInputChange(
        addressType === 'dest_address' ? 'dest_lat' : 'pickup_lat',
        item.lat || 0,
      );
      handleInputChange(
        addressType === 'dest_address' ? 'dest_lng' : 'pickup_lng',
        item.lng || 0,
      );
    }
  };
  

  const handleSubmit = async () => {
    const payload = {
      initiatorId: user.id,
      accountType: user.accountType,
      pickup_address: form.pickup_address,
      pickup_lat: Number(form.pickup_lat),
      pickup_lng: Number(form.pickup_lat),
      dest_address: form.dest_address,
      dest_lat: Number(form.dest_lat),
      dest_lng: Number(form.dest_lat),
      current_address: origin.address,
      current_lat: Number(origin.lat),
      current_lng: Number(origin.lng),
      numberOfSeats: Number(form.seats),
      amount: Number(rawAmount),
      waitTimeMinutes: Number(form.waitTimeMinutes),
      radius: 10, // 30 minutes from now
      type_of_ride: form.type_of_ride, // adjust based on backend enum
      note: form.note,
    };

    setLoading(true);
    try {
      const rideRes = await postAPI(
        `/api/ride-request`,
        payload,
        'POST',
        JWTtoken || '',
      );
      if (ZodChecker(rideRes)) {
        return;
      }
      if (rideRes.success) {
        Toast.show({
          type: 'success',
          text1: 'Youre now online, Trip session create',
        });

        const userdata: User = {
          ...user,
          isAvaliable: true,
          rideRequest: rideRes.data
        };
        setUser(userdata);
        router.push('/(root)/(tabs)');
        return;
      }
      Toast.show({
        type: 'error',
        text1: 'Error unable to create, try again',
      });
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView
        className="px-4 mb-4 flex-1"
        style={{ backgroundColor: colors.background }}
        onTouchMove={() => {}}
      >
        <DashboardPagesHeader
          onBack={true}
          centerElement={'Create Trip Session'}
        />
        <View className=" flex-1">
          <FormKeyboardView useScroll={true} flex1={true}>
            <Text className="text-sm font-thin mb-4">
              fill this below form to start a trip session which will enable
              passenger to connect, book and join your ride going to your
              destination
            </Text>
            <Text className="text-xs " style={{ color: colors.text }}>
              Please select from suggestions to get accurate location
            </Text>
            <View className="gap-0">
              <View className="gap-1 mt-3">
                <Text className="text-textColor text-sm ">
                  Destination Address:
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setAddressType('dest_address');
                    setisVisible(true);
                  }}
                  className="rounded-2xl w-full h-14 px-2 py-3 border border-gray-400 flex-row gap-2 justify-start items-center"
                >
                  <Feather name="map-pin" size={20} color={'#f8717170'} />
                  <Text
                    className="text-textColor text-lg text-wrap"
                    numberOfLines={2}
                  >
                    {form.dest_address
                      ? form.dest_address
                      : 'Enter Destination address'}
                  </Text>
                </TouchableOpacity>
              </View>
                  <View className="gap-1 my-3">
                    <Text className="text-textColor text-sm ">
                      Pickup Address:
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setAddressType('pickup_address');
                        setisVisible(true);
                      }}
                      className="rounded-2xl w-full h-14 px-2 py-3 border border-gray-400 flex-row gap-2 justify-start items-center"
                    >
                      <Feather name="map-pin" size={20} color={'#07657270'} />
                      <Text
                        className="text-textColor text-lg text-wrap"
                        numberOfLines={2}
                      >
                        {form.pickup_address
                          ? form.pickup_address
                          : 'Enter Pickup address'}
                      </Text>
                    </TouchableOpacity>
                  </View>

              {form.dest_address && form.dest_lat && form.pickup_lat && rideMaxAmount ? (
                <>

                  <Input
                    labelElement={
                      <View className="justify-between items-center flex-row">
                        <Text
                          className="text-sm "
                          style={{ color: colors.text }}
                        >
                          Ride Amount
                        </Text>
                        <Text className="text-sm text-red-500 font-bold">
                          Max:
                          {form.dest_lat
                            ? `${NAIRA}${formatCurrency(rideMaxAmount)}`
                            : 'Nil'}
                        </Text>
                      </View>
                    }
                    icon={
                      <FontAwesome6
                        name="naira-sign"
                        size={20}
                        color={colors.text}
                      />
                    }
                    placeholder="₦ Enter amount"
                    keyboardType="numeric"
                    value={`${form.amount}`}
                    onChangeText={(val) => handleInputChange('amount', val)}
                  />

                  <SelectField
                    label="Ride Type"
                    defaultInputType={{
                      label: 'Select Ride Type',
                      value: 'none',
                    }}
                    inputType={listOfRideTypes}
                    selectedValue={form.type_of_ride}
                    onValueChange={(val) =>
                      handleInputChange('type_of_ride', String(val))
                    }
                    mode="dialog"
                    className="text-2xl"
                  />
                  <Input
                    label="No of available seats"
                    placeholder="Enter 3"
                    keyboardType="numeric"
                    maxLength={1}
                    value={`${form.seats}`}
                    onChangeText={(val) => handleInputChange('seats', val)}
                  />
                  <Input
                    label="Maximum Waiting Time (minutes)"
                    placeholder="Enter minutes"
                    keyboardType="numeric"
                    maxLength={2}
                    value={`${form.waitTimeMinutes}`}
                    onChangeText={(val) =>
                      handleInputChange('waitTimeMinutes', val)
                    }
                  />

                  <Input
                    label="Additional Notes"
                    placeholder="Add any special instructions"
                    multiline
                    numberOfLines={3}
                    value={`${form.note}`}
                    onChangeText={(val) => handleInputChange('note', val)}
                  />
                  <Button
                    title={'Create Now'}
                    onPress={handleSubmit}
                    isLoading={loading}
                  />
                </>
              ) : null}
            </View>
          </FormKeyboardView>
        </View>
      </SafeAreaView>
      <CustomBottomSheet
        isVisible={isVisible}
        onClose={() => {
          Keyboard.dismiss();
          setisVisible(false);
        }}
        mainClass="h-[80%] w-full"
      >
        <View className="flex-1 p-5">
          <Text className="text-xs " style={{ color: colors.text }}>
            Please select from suggestions to get accurate location
          </Text>
          <FormKeyboardView useScroll={true}>
            <AddressInputWithSuggestions
              labelElement={
                <View className="justify-between items-center flex-row">
                  <Text className="text-sm " style={{ color: colors.text }}>
                    {addressType === 'dest_address'
                      ? 'Destination Address'
                      : 'Pickup Address'}
                    :
                  </Text>
                  <Text className="text-sm text-gray-400 font-semibold italic">
                    (
                    {addressType === 'dest_address'
                      ? 'where you are going'
                      : 'Location where passenger will join your ride'}
                    )
                  </Text>
                </View>
              }
              placeholder={
                addressType === 'dest_address'
                  ? 'Enter your destination'
                  : 'Enter your pickup point'
              }
              value={
                addressType === 'dest_address'
                  ? form.dest_address
                  : form.pickup_address
              }
              handleInputChange={(val) => handleInputChange(addressType, val)}
              onSelect={handleSelectAddr}
              icon={
                <Feather
                  name="map-pin"
                  size={20}
                  color={addressType === 'dest_address' ? '#f8717170' : ''}
                />
              }
            />
          </FormKeyboardView>
        </View>
      </CustomBottomSheet>
    </>
  );
}
