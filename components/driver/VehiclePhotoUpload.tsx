import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '@/store/useThemeStore';

interface UploadedFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

interface VehiclePhotos {
  frontView: UploadedFile | null;
  rearView: UploadedFile | null;
}

interface VehiclePhotoUploadProps {
  photos: VehiclePhotos;
  onPhotosChange: (photos: VehiclePhotos) => void;
}

export function VehiclePhotoUpload({
  photos,
  onPhotosChange,
}: VehiclePhotoUploadProps) {
  const { colors } = useThemeStore();
  const [uploading, setUploading] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please allow access to the camera and gallery to upload photos.'
      );
      return false;
    }
    return true;
  };

  const showImagePicker = (photoType: keyof VehiclePhotos) => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add the photo',
      [
        { text: 'Camera', onPress: () => openCamera(photoType) },
        { text: 'Gallery', onPress: () => openGallery(photoType) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async (photoType: keyof VehiclePhotos) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploading(photoType);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: UploadedFile = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `vehicle_${photoType}_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        };

        onPhotosChange({
          ...photos,
          [photoType]: file,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setUploading(null);
    }
  };

  const openGallery = async (photoType: keyof VehiclePhotos) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploading(photoType);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: UploadedFile = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `vehicle_${photoType}_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        };

        onPhotosChange({
          ...photos,
          [photoType]: file,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
    } finally {
      setUploading(null);
    }
  };

  const removePhoto = (photoType: keyof VehiclePhotos) => {
    onPhotosChange({
      ...photos,
      [photoType]: null,
    });
  };

  const renderPhotoUpload = (
    photoType: keyof VehiclePhotos,
    title: string,
    description: string
  ) => {
    const photo = photos[photoType];
    const isUploading = uploading === photoType;

    return (
      <View style={styles.photoSection}>
        <Text style={[styles.photoTitle, { color: colors.text }]}>
          {title} *
        </Text>
        <Text style={[styles.photoDescription, { color: colors.gray }]}>
          {description}
        </Text>

        <TouchableOpacity
          style={[
            styles.photoUploadArea,
            {
              backgroundColor: photo ? colors.card : colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={() => showImagePicker(photoType)}
          disabled={isUploading}
        >
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.error }]}
                onPress={() => removePhoto(photoType)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              {isUploading ? (
                <View style={styles.uploadingContainer}>
                  <Ionicons name="cloud-upload" size={32} color={colors.gray} />
                  <Text style={[styles.uploadingText, { color: colors.gray }]}>
                    Uploading...
                  </Text>
                </View>
              ) : (
                <View style={styles.uploadContainer}>
                  <Ionicons name="camera" size={32} color={colors.gray} />
                  <Text style={[styles.uploadText, { color: colors.gray }]}>
                    Tap to add photo
                  </Text>
                  <Text style={[styles.uploadSubtext, { color: colors.gray }]}>
                    JPG or PNG, max 5MB
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Vehicle Photos
      </Text>
      <Text style={[styles.sectionDescription, { color: colors.gray }]}>
        Upload clear, well-lit photos of your vehicle. License plate must be
        clearly visible.
      </Text>

      {renderPhotoUpload(
        'frontView',
        'Front View',
        'Clear photo showing the front of your vehicle with license plate visible'
      )}

      {renderPhotoUpload(
        'rearView',
        'Rear View',
        'Clear photo showing the rear of your vehicle with license plate visible'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  photoDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
  },
  photoUploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  photoPreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  uploadingText: {
    fontSize: 14,
    marginTop: 8,
  },
});