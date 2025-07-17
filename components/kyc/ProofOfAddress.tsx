import React, { useEffect, useState } from 'react';
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

type UploadStatus = 'idle' | 'success' | 'fail';

const ProofOfAddress = ({ user }: { user: User }) => {
  const [proofAddressImage, setproofAddressImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [frontStatus, setFrontStatus] = useState<UploadStatus>('idle');
  const [zoomImage, setZoomImage] = useState<string | null>(null);


  const pickImage = async (side: boolean) => {
    if (!(await requestPermissions())) return;

    const mediaFILE = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3,4],
      quality: 1,
    });

    if (
      !mediaFILE.canceled &&
      mediaFILE.assets &&
      mediaFILE.assets.length > 0
    ) {
      setproofAddressImage(mediaFILE.assets[0].uri);
      setFrontStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!proofAddressImage || !user?.id) {
      Alert.alert('Upload Error', 'Missing required images or user ID.');
      return;
    }

    const apilink = `${BASEURL}/api/uploads/kyc`;
    setIsLoading(true);

    try {
        const param = {
          userid: user.id,
          kyctype: 'proof_address',
          position: "front",
          features: '',
        };

        const res = await FileSystem.uploadAsync(apilink, proofAddressImage, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'uploadfile',
          parameters: param,
        });
        
        const jsonResponse = JSON.parse(res.body);

        if (jsonResponse.status === 'success') {
          setFrontStatus('success')
        } else {
          setFrontStatus('fail');
        }
      
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Upload Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setproofAddressImage(null);
    setFrontStatus('idle');
  };

  return (
    <View className="items-center justify-center flex-1 ">
      {/* Zoom Modal */}
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
        <Text className="text-gray-500 text-center mb-6 text-sm">
          Please upload clear photo of any utility bill confirm your full name (e.g., Nepa Bill, Bank Statement, Water Bill).
        </Text>

        <View className="flex mb-6 gap-4">
          {/* Front Side */}
          <View className="flex">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold">Ultility Image</Text>

              {proofAddressImage && (
                <TouchableOpacity
                  className={`${frontStatus === 'success' ? 'bg-green-300' : 'bg-red-200'} px-3 rounded-lg`}
                  onPress={() => handleRetake()}
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
                proofAddressImage ? setZoomImage(proofAddressImage) : pickImage(true)
              }
              activeOpacity={proofAddressImage ? 0.7 : 1}
            >
              {proofAddressImage ? (
                <Image
                  source={{ uri: proofAddressImage }}
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
          
        </View>
      </ScrollView>
      <View className="absolute bottom-3 left-0 right-0 py-3 ">
        {frontStatus === 'success' ? (
          <View className="items-start mb-2 flex-row">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text className="text-green-600 font-semibold mt-2">
              Thanks your document was submitted successfully, and its under
              review
            </Text>
          </View>
        ): (
          <Button
            title="Upload"
            onPress={handleUpload}
            isLoading={isLoading}
            icon={
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            }
            classStyle="mt-2"
            disabled={!proofAddressImage || isLoading}
          />
        )}
      </View>
    </View>
  );
};

export default ProofOfAddress;
