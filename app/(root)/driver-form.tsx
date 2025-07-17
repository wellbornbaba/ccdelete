import {
  View,
  Text,
  Pressable,
  Switch,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Redirect, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { FormKeyboardView } from '@/components/ui/FormKeyboardView';
import { Input } from '@/components/ui/Input';
import { GroupedCarModelPicker } from '@/components/driver/GroupedCarModelPicker';
import { Button } from '@/components/ui/Button';
import { BASEURL } from '@/utils/fetch';
import BgLoading from '@/components/BgLoading';
import { SelectField } from '@/components/ui/SelectField';
import { carColors, carYears, seatOptions } from '@/constants/carOptions';
import { requestPermissions, ZodChecker } from '@/utils';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { bgPrimarColor } from '@/utils/colors';
import ImageViewer from 'react-native-image-zoom-viewer';

type UploadStatus = 'idle' | 'success' | 'fail';
const car_colors = carColors.map((color) => ({
  label: color,
  value: color.toLowerCase(), // Optional: normalize value
}));

const car_years = carYears.map((year) => ({
  label: year,
  value: year,
}));

const car_seats = seatOptions.map((seat) => ({
  label: seat,
  value: Number(seat),
}));
const driverAttension = ['pending', 'rejected'];

export default function DriverForm() {
  const colors = useThemeStore((s) => s.colors);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [carModel, setCarModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [frontStatus, setFrontStatus] = useState<UploadStatus>('idle');
  const [backStatus, setBackStatus] = useState<UploadStatus>('idle');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [fileFrontSet, setfileFrontSet] = useState('');
  const [fileBackSet, setfileBackSet] = useState('');
  const apilink = `${BASEURL}/api/uploads/driverdoc`;
  const allImages = [
    { uri: fileFrontSet, position: 'front' },
    { uri: fileBackSet, position: 'back' },
  ];

  const [form, setForm] = useState({
    model: '',
    plate_number: '',
    interior_color: '',
    exterior_color: '',
    seats: 1,
    chasis: '',
    ac: false,
    year: '',
    registered: '',
    onwers_fullname: '',
    drivers_license: '',
    vechicle_registration: '',
    insurance: '',
  });

  
  useEffect(() => {
    if (!user) router.back();
    if (user?.driver) {
      const editItemDta = user.driver;

      setFrontImage(`${BASEURL}${editItemDta.front_car_url}`);
      setBackImage(`${BASEURL}${editItemDta.back_car_url}`);
      setCarModel(editItemDta?.model ?? '');
      Object.entries({
        model: editItemDta.model,
        plate_number: editItemDta.plate_number,
        interior_color: editItemDta.interior_color,
        exterior_color: editItemDta.exterior_color,
        seats: Number(editItemDta.seats || 4),
        chasis: editItemDta.chasis,
        ac: editItemDta.ac,
        year: editItemDta.year,
        registered: editItemDta.registered ? 1 : 0,
        onwers_fullname: editItemDta.onwers_fullname
          ? editItemDta.onwers_fullname
          : `${user.firstName} ${user.lastName}`,
        drivers_license: editItemDta.drivers_license,
        vechicle_registration: editItemDta.vechicle_registration,
        insurance: editItemDta.insurance,
      }).forEach(([key, value]) =>
        handleInputChange(key as keyof typeof form, String(value)),
      );
    }
  }, []);

  if (!user) return <BgLoading popup={true} />;

  const handleUpdate = async () => {
    if (!frontImage || !backImage || !user?.id) {
      Alert.alert('Upload Error', 'Missing required images.');
      return;
    }
    setIsLoading(true);

    try {
      let checkUpload = false;
      for (const { uri, position } of allImages) {
        if (uri) {
          const param: Record<string, string> = {
            userid: user.id,
            position: String(position),
            ...Object.fromEntries(
              Object.entries(form).map(([k, v]) => [k, String(v)]),
            ),
            model: String(carModel),
          };

          const res = await FileSystem.uploadAsync(apilink, uri, {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'uploadfile',
            parameters: param,
          });
          const jsonResponse = JSON.parse(res.body);

          if (ZodChecker(jsonResponse)) {
            return;
          }
          if (!jsonResponse.success) {
            Toast.show({
              type: 'error',
              text1: jsonResponse.message,
            });

            return;
          }

          position === 'front'
            ? setFrontStatus('success')
            : setBackStatus('success');

          checkUpload = true;
        }
      }

      if (checkUpload) {
        setUploaded(true);
        setfileFrontSet('');
        setfileBackSet('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sorry unable to update your file, try again',
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong. Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    name: keyof typeof form,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = async (side: 'front_car_url' | 'back_car_url') => {
    if (!(await requestPermissions())) return;

    const mediaFILE = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (
      !mediaFILE.canceled &&
      mediaFILE.assets &&
      mediaFILE.assets.length > 0
    ) {
      if (side === 'front_car_url') {
        setfileFrontSet(mediaFILE.assets[0].uri);
        setFrontImage(mediaFILE.assets[0].uri);
      } else {
        setfileBackSet(mediaFILE.assets[0].uri);
        setBackImage(mediaFILE.assets[0].uri);
      }
      setBackStatus('idle');
      setFrontStatus('idle');
    }
  };

  if (!user) return <Redirect href={'/(root)/(tabs)'} />;
  const formList = [
    ['year', 'Year'],
    ['interior_color', 'Interior Color'],
    ['exterior_color', 'Exterior Color'],
    ['seats', 'Seats'],
    ['registered', 'Registered (Yes/No)'],
    ['onwers_fullname', "Owner's Full Name"],
    ['plate_number', 'Plate Number'],
    ['chasis', 'Chassis Number'],
    ['drivers_license', "Driver's License Number"],
    ['vechicle_registration', 'Vehicle Registration Number'],
    ['insurance', 'Insurance'],
  ];

  return (
    <>
      <Modal
        visible={!!zoomImage}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomImage(null)}
      >
        <View className="flex-1 bg-black/90">
          <TouchableOpacity
            className="absolute top-8 right-8 z-10"
            onPress={() => setZoomImage(null)}
          >
            <Ionicons name="close" size={36} color={bgPrimarColor} />
          </TouchableOpacity>
          {zoomImage && (
            <ImageViewer
              imageUrls={[{ url: zoomImage }]}
              enableSwipeDown
              onSwipeDown={() => setZoomImage(null)}
              backgroundColor="rgba(0,0,0,0.95)"
              renderIndicator={() => <></>}
              saveToLocalByLongPress={false}
            />
          )}
        </View>
      </Modal>
      <SafeAreaView
        className="px-4 mb-4 flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <DashboardPagesHeader
          onBack={true}
          onBackHandle={() => {
            driverAttension.includes(user.driver?.dstatus || 'pending')
              ? signOut()
              : router.back();
          }}
          centerElement={'Vehicle Details'}
        />
        <FormKeyboardView useScroll={true} flex1={true}>
          <Text className="text-sm font-normal mb-4">
            As a driver you are required to update upload your Vehicle details
            below
          </Text>
          {user.driver?.dstatus === 'inprogress' ? (
            <>
              <View className="justify-center items-center">
                <Text className="text-md text-teal-800 p-2">
                  You have submitted your detail, we are verifying it at the
                  moment. please check back once approved, a notification will
                  be sent to your Phone number or email addrees
                </Text>

                <Button onPress={() => signOut()} title="Log out" />
              </View>
            </>
          ) : (
            <>
              {uploaded ? (
                <View className="justify-center items-center">
                  <Text className="text-md text-teal-800 p-2">
                    Uploaded successfully, we will reveiw your documents and
                    upgrade your account
                  </Text>

                  <Button
                    onPress={() => router.navigate('/(root)/(tabs)')}
                    title="Go to Dashboard"
                  />
                </View>
              ) : (
                <>
                  <GroupedCarModelPicker
                    label="Car Model"
                    value={carModel}
                    onChange={setCarModel}
                  />
                  {carModel ? (
                    <>
                      {formList.map(([key, label]) => {
                        switch (key) {
                          case 'interior_color':
                          case 'exterior_color':
                            return (
                              <SelectField
                                key={key}
                                defaultInputType={{
                                  label: `Select ${label}`,
                                  value: 'none',
                                }}
                                inputType={car_colors}
                                selectedValue={
                                  form[key as keyof typeof form] as string
                                }
                                onValueChange={(text) =>
                                  handleInputChange(
                                    key as keyof typeof form,
                                    String(text),
                                  )
                                }
                                mode="dialog"
                                className="text-2xl"
                              />
                            );

                          case 'seats':
                            return (
                              <SelectField
                                key={key}
                                defaultInputType={{
                                  label: 'Select Number of Seats',
                                  value: 'none',
                                }}
                                inputType={car_seats}
                                selectedValue={Number(form.seats)}
                                onValueChange={(val) =>
                                  handleInputChange(
                                    key as keyof typeof form,
                                    String(val),
                                  )
                                }
                                mode="dialog"
                                className="text-2xl"
                              />
                            );

                          case 'year':
                            return (
                              <SelectField
                                key={key}
                                defaultInputType={{
                                  label: 'Select Year',
                                  value: 'none',
                                }}
                                inputType={car_years}
                                selectedValue={
                                  form[key as keyof typeof form] as
                                    | string
                                    | number
                                }
                                onValueChange={(val) =>
                                  handleInputChange(
                                    key as keyof typeof form,
                                    String(val),
                                  )
                                }
                                mode="dialog"
                                className="text-2xl"
                              />
                            );
                          case 'registered':
                            return (
                              <SelectField
                                key={key}
                                defaultInputType={{
                                  label: 'Registered',
                                  value: 'none',
                                }}
                                inputType={[
                                  { label: 'Yes', value: 1 },
                                  { label: 'No', value: 0 },
                                ]}
                                selectedValue={Number(form.registered)}
                                onValueChange={(val) =>
                                  handleInputChange(
                                    key as keyof typeof form,
                                    String(val),
                                  )
                                }
                                mode="dialog"
                                className="text-2xl"
                              />
                            );
                          default:
                            return (
                              <Input
                                label={label}
                                key={key}
                                placeholder={label}
                                classStyle="p-0"
                                value={
                                  key === 'onwers_fullname'
                                    ? `${user.firstName} ${user.lastName}`
                                    : (form[key as keyof typeof form] as string)
                                }
                                onChangeText={(text) =>
                                  handleInputChange(
                                    key as keyof typeof form,
                                    text,
                                  )
                                }
                              />
                            );
                        }
                      })}

                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-base">Air Conditioning</Text>
                        <Switch
                          value={form.ac ? true : false}
                          onValueChange={(val) => handleInputChange('ac', val)}
                          thumbColor={form.ac ? '#0f766e' : '#ccc'}
                          trackColor={{ true: '#5eead4', false: '#e5e7eb' }}
                        />
                      </View>

                      <View className="mb-3">
                        <Text className="mb-1">Upload Front View</Text>
                        <Pressable
                          className="bg-gray-100 h-36 justify-center items-center rounded-lg mb-3"
                          onPress={() => pickImage('front_car_url')}
                          onLongPress={() =>
                            frontImage
                              ? setZoomImage(frontImage)
                              : pickImage('front_car_url')
                          }
                        >
                          {frontImage ? (
                            <Image
                              source={{ uri: frontImage }}
                              className="w-full h-full rounded-lg"
                              resizeMode="cover"
                            />
                          ) : (
                            <Text className="text-gray-400">
                              Tap to upload front view
                            </Text>
                          )}
                        </Pressable>

                        <Text className="mb-1">Upload Back View</Text>
                        <Pressable
                          className="bg-gray-100 h-36 justify-center items-center rounded-lg"
                          onPress={() => pickImage('back_car_url')}
                          onLongPress={() => {
                            backImage
                              ? setZoomImage(backImage)
                              : pickImage('back_car_url');
                          }}
                        >
                          {backImage ? (
                            <Image
                              source={{ uri: backImage }}
                              className="w-full h-full rounded-lg"
                              resizeMode="cover"
                            />
                          ) : (
                            <Text className="text-gray-400">
                              Tap to upload back view
                            </Text>
                          )}
                        </Pressable>
                      </View>
                      {user.driver?.dstatus === 'approved' ? null : (
                        <Button
                          onPress={handleUpdate}
                          title="Update"
                          isLoading={isLoading}
                        />
                      )}
                    </>
                  ) : null}
                </>
              )}
            </>
          )}
        </FormKeyboardView>
      </SafeAreaView>
    </>
  );
}
