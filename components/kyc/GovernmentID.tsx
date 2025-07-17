import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { User } from '@/types';
import { Button } from '../ui/Button';
import { bgPrimarColor, textGrayColor } from '@/utils/colors';
import { requestPermissions } from '@/utils';
import { BASEURL } from '@/utils/fetch';
import { SelectField } from '../ui/SelectField';

type UploadStatus = 'idle' | 'success' | 'fail';

interface IDType {
  label: string;
  value: string;
}

const listOfIds: IDType[] = [
  {
    label: 'International Passport',
    value: 'international-passport',
  },
  {
    label: 'NIMC',
    value: 'nimc',
  },
  {
    label: 'Drivers License',
    value: 'drivers-license',
  },
];

interface GovernmentIDProps {
  user: User;
}

const GovernmentID: React.FC<GovernmentIDProps> = ({ user }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [frontStatus, setFrontStatus] = useState<UploadStatus>('idle');
  const [backStatus, setBackStatus] = useState<UploadStatus>('idle');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');

  const pickImage = useCallback(async (side: 'front' | 'back') => {
    try {
      if (!(await requestPermissions())) return;

      const mediaFILE = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (
        !mediaFILE.canceled &&
        mediaFILE.assets &&
        mediaFILE.assets.length > 0
      ) {
        if (side === 'front') {
          setFrontImage(mediaFILE.assets[0].uri);
          setFrontStatus('idle');
        } else {
          setBackImage(mediaFILE.assets[0].uri);
          setBackStatus('idle');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    // Validation
    if (!selectedId) {
      Alert.alert('Upload Error', 'Please select an ID type.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Upload Error', 'User ID is missing.');
      return;
    }

    if (selectedId === 'international-passport' && !frontImage) {
      Alert.alert('Upload Error', 'Your passport face is required');
      return;
    }

    if (
      selectedId !== 'international-passport' &&
      (!frontImage || !backImage)
    ) {
      Alert.alert('Upload Error', 'Both front and back images are required for this ID type.');
      return;
    }

    const apilink = `${BASEURL}/api/uploads/kyc`;
    const imagesToUpload = [];

    if (frontImage) {
      imagesToUpload.push({ uri: frontImage, position: 'front' });
    }
    if (backImage && selectedId !== 'international-passport') {
      imagesToUpload.push({ uri: backImage, position: 'back' });
    }

    setIsLoading(true);

    try {
      for (const { uri, position } of imagesToUpload) {
        const param = {
          userid: user.id,
          kyctype: 'government_id',
          position,
          features: selectedId,
        };

        const res = await FileSystem.uploadAsync(apilink, uri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'uploadfile',
          parameters: param,
        });

        const jsonResponse = JSON.parse(res.body);

        if (jsonResponse.status === 'success') {
          position === 'front'
            ? setFrontStatus('success')
            : setBackStatus('success');
        } else {
          position === 'front'
            ? setFrontStatus('fail')
            : setBackStatus('fail');
          
          // Show specific error message if available
          const errorMessage = jsonResponse.message || 'Upload failed';
          Alert.alert('Upload Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Upload Failed', 'Something went wrong. Please try again.');
      setFrontStatus('fail');
      if (selectedId !== 'international-passport') {
        setBackStatus('fail');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedId, frontImage, backImage, user?.id]);

  const handleRetake = useCallback((side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
      setFrontStatus('idle');
    } else {
      setBackImage(null);
      setBackStatus('idle');
    }
  }, []);

  const handleIdTypeChange = useCallback((value: string) => {
    setSelectedId(value);
    setFrontImage(null);
    setBackImage(null);
    setFrontStatus('idle');
    setBackStatus('idle');
  }, []);

  return (
    <View className="items-center justify-center flex-1">
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className='flex-1'>
        <Text className="text-gray-500 text-center mb-6 text-sm">
          Please upload clear photos of the front and back of your
          government-issued ID (e.g., International passport, driver's license,
          NIMC ID).
        </Text>

        <SelectField
          label="Select Verification ID"
          defaultInputType={{
            label: 'Select',
            value: 'none',
          }}
          inputType={listOfIds}
          selectedValue={selectedId}
          onValueChange={(val) => handleIdTypeChange(String(val))}
          mode="dialog"
          className="text-2xl"
        />

        {selectedId && (
          <View className="flex mb-6 gap-4">
            {/* Front Side */}
            <View className="flex">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold">Front ID</Text>

                {frontImage && (
                  <TouchableOpacity
                    className={`${frontStatus === 'success' ? 'bg-green-300' : 'bg-red-200'} px-3 rounded-lg`}
                    onPress={() => handleRetake('front')}
                    disabled={isLoading}
                  >
                    <Text className="text-gray-700 font-bold">
                      {frontStatus === 'success'
                        ? 'Uploaded success'
                        : frontStatus === 'fail'
                          ? 'Failed'
                          : 'Remove'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                className="w-full h-40 rounded-lg bg-gray-100 items-center justify-center overflow-hidden mb-2"
                onPress={() =>
                  frontImage ? setZoomImage(frontImage) : pickImage('front')
                }
                activeOpacity={frontImage ? 0.7 : 1}
              >
                {frontImage ? (
                  <Image
                    source={{ uri: frontImage }}
                    className="w-full h-full"
                    style={{ resizeMode: 'cover' }}
                  />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={38}
                    color={textGrayColor + '70'}
                  />
                )}
              </TouchableOpacity>
            </View>

            {selectedId !== 'international-passport' && (
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold">Back ID</Text>

                  {backImage && (
                    <TouchableOpacity
                      className={`${backStatus === 'success' ? 'bg-green-300' : 'bg-red-200'} px-3 rounded-lg`}
                      onPress={() => handleRetake('back')}
                      disabled={isLoading}
                    >
                      <Text className="text-gray-700 font-bold">
                        {backStatus === 'success'
                          ? 'Uploaded success'
                          : backStatus === 'fail'
                            ? 'Failed'
                            : 'Remove'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  className="w-full h-40  rounded-lg bg-gray-100 items-center justify-center overflow-hidden mb-2"
                  onPress={() =>
                    backImage ? setZoomImage(backImage) : pickImage('back')
                  }
                  activeOpacity={backImage ? 0.7 : 1}
                >
                  {backImage ? (
                    <Image
                      source={{ uri: backImage }}
                      className="w-full h-full"
                      style={{ resizeMode: 'cover' }}
                    />
                  ) : (
                    <Ionicons
                      name="cloud-upload-outline"
                      size={38}
                      color={textGrayColor + '70'}
                    />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        </View>
      </ScrollView>
      <View className="absolute bottom-3 left-0 right-0 py-3">
        {selectedId &&
          (() => {
            const isPassport = selectedId === 'international-passport';
            const isSuccess =
              frontStatus === 'success' &&
              (isPassport || backStatus === 'success');
            const isFail =
              frontStatus === 'fail' &&
              (!isPassport ? backStatus === 'fail' : true);
            const isReadyToUpload = isPassport
              ? frontImage
              : frontImage && backImage;

            if (isSuccess) {
              return (
                <View className="items-start mb-2 flex-row">
                  <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                  <Text className="text-green-600 font-semibold mt-2">
                    Thanks, your document was submitted successfully and is
                    under review.
                  </Text>
                </View>
              );
            }

            if (isFail) {
              return (
                <View className="items-start mb-2 flex-row">
                  <Ionicons name="close-circle" size={48} color="#ef4444" />
                  <View className="flex-1 ml-2">
                    <Text className="text-red-600 font-semibold">
                      Verification Failed
                    </Text>
                    <Text className="text-red-500 text-sm mt-1">
                      Please retake the photos and try again.
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <Button
                title="Upload"
                onPress={handleUpload}
                isLoading={isLoading}
                icon={
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="#fff"
                  />
                }
                classStyle="mt-2"
                disabled={!isReadyToUpload || isLoading}
              />
            );
          })()}
      </View>
    </View>
  );
};

export default GovernmentID;
