import { useState } from 'react';
import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SecurityService } from '@/services/SecurityService';
import { ApiService } from '@/services/ApiService';
import { UploadProgress } from '@/types/faceDetection';

export function useImageCapture() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const { compressionQuality, autoUpload, maxRetries, maxFileSize } = useSettingsStore();

  const captureImage = async (cameraRef: CameraView | null): Promise<string | null> => {
    if (!cameraRef) return null;

    try {
      setCaptureAttempts(prev => prev + 1);
      
      // Check device storage before capture
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      if (freeSpace < 100 * 1024 * 1024) { // Less than 100MB
        throw new Error('Insufficient storage space');
      }
      
      // Capture the image
      const photo = await cameraRef.takePictureAsync({
        quality: compressionQuality,
        base64: true, // Enable for processing
        exif: false,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture image');
      }

      // Validate image file size
      const fileInfo = await FileSystem.getInfoAsync(photo.uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > maxFileSize * 1024 * 1024) {
        throw new Error(`Image too large. Maximum size: ${maxFileSize}MB`);
      }
      
      // Process and compress the image
      const processedImage = await processImage(photo.uri);
      
      // Add metadata
      const imageWithMetadata = await addImageMetadata(processedImage.uri);
      
      // Save to device gallery
      await saveToGallery(imageWithMetadata);

      return imageWithMetadata;
    } catch (error) {
      console.error('Image capture failed:', error);
      throw error;
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      // Get image info first
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Calculate optimal resize dimensions
      const maxDimension = 1024;
      const aspectRatio = imageInfo.width / imageInfo.height;
      let newWidth = imageInfo.width;
      let newHeight = imageInfo.height;
      
      if (imageInfo.width > maxDimension || imageInfo.height > maxDimension) {
        if (aspectRatio > 1) {
          newWidth = maxDimension;
          newHeight = maxDimension / aspectRatio;
        } else {
          newHeight = maxDimension;
          newWidth = maxDimension * aspectRatio;
        }
      }
      
      // Resize and compress the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: Math.round(newWidth), height: Math.round(newHeight) } },
          // Add subtle sharpening for better quality
          { 
            crop: { 
              originX: 0, 
              originY: 0, 
              width: Math.round(newWidth), 
              height: Math.round(newHeight) 
            } 
          },
        ],
        {
          compress: compressionQuality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      return manipulatedImage;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw error;
    }
  };

  const addImageMetadata = async (imageUri: string): Promise<string> => {
    try {
      // Generate unique image ID
      const imageId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${imageUri}_${Date.now()}_${Math.random()}`
      );
      
      // Get device info
      const deviceInfo = {
        deviceId: Device.osInternalBuildId || 'unknown',
        deviceType: Device.deviceType,
        osVersion: Device.osVersion,
        appVersion: '1.0.0',
      };
      
      // Create metadata file
      const metadata = {
        imageId: imageId.substring(0, 16),
        timestamp: new Date().toISOString(),
        captureAttempt: captureAttempts,
        deviceInfo,
        compressionQuality,
      };
      
      const metadataPath = `${FileSystem.documentDirectory}metadata_${metadata.imageId}.json`;
      await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadata));
      
      return imageUri;
    } catch (error) {
      console.error('Failed to add metadata:', error);
      return imageUri; // Return original if metadata fails
    }
  };

  const saveToGallery = async (imageUri: string) => {
    try {
      // Create album if it doesn't exist
      let album = await MediaLibrary.getAlbumAsync('FaceCapture');
      if (!album) {
        const asset = await MediaLibrary.createAssetAsync(imageUri);
        album = await MediaLibrary.createAlbumAsync('FaceCapture', asset, false);
      } else {
        const asset = await MediaLibrary.createAssetAsync(imageUri);
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (error) {
      console.error('Failed to save to gallery:', error);
      // Don't throw here, as the image was still captured successfully
    }
  };

  const uploadImage = async (imageUri: string): Promise<void> => {
    if (!autoUpload) return;

    // Check network connectivity
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      throw new Error('No network connection available');
    }
    
    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: 100, percentage: 0, speed: 0, estimatedTimeRemaining: 0 });

    try {
      // Perform security checks
      const securityCheck = await SecurityService.performSecurityAudit();
      if (securityCheck.score < 70) {
        console.warn('Security score low:', securityCheck.score);
      }
      
      // Encrypt the image before upload
      const encryptedData = await SecurityService.encryptFile(imageUri);
      
      // Upload to backend
      const uploadResult = await ApiService.uploadImage(encryptedData, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        timeout: 30000, // 30 second timeout
        retries: maxRetries,
      });
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      console.log('Image uploaded successfully:', uploadResult.imageId);
      
      // Clean up local encrypted data
      await SecurityService.cleanupTempFiles();
      
    } catch (error) {
      console.error('Image upload failed:', error);
      
      // Show user-friendly error message
      Alert.alert(
        'Upload Failed',
        getUploadErrorMessage(error),
        [{ text: 'OK' }]
      );
      
      // Queue for retry
      await queueForRetry(imageUri);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const getUploadErrorMessage = (error: any): string => {
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      return 'Network connection failed. The image was saved locally and will be uploaded when connection is restored.';
    }
    if (error.message?.includes('timeout')) {
      return 'Upload timed out. Please check your connection and try again.';
    }
    if (error.message?.includes('size')) {
      return 'Image file is too large. Please try capturing again with lower quality settings.';
    }
    return 'Upload failed. The image was saved locally and will be retried automatically.';
  };

  const queueForRetry = async (imageUri: string) => {
    try {
      // Store failed uploads for retry
      const retryQueue = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + 'retry_queue.json'
      ).catch(() => '[]');
      
      const queue = JSON.parse(retryQueue);
      queue.push({
        imageUri,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries,
        lastAttempt: Date.now(),
      });
      
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'retry_queue.json',
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error('Failed to queue for retry:', error);
    }
  };

  const retryFailedUploads = async () => {
    try {
      const retryQueue = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + 'retry_queue.json'
      ).catch(() => '[]');
      
      const queue = JSON.parse(retryQueue);
      const successfulUploads: number[] = [];
      const currentTime = Date.now();
      
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        
        // Skip if max retries reached
        if (item.retryCount >= (item.maxRetries || maxRetries)) {
          continue;
        }
        
        // Exponential backoff: wait longer between retries
        const backoffTime = Math.pow(2, item.retryCount) * 60000; // Start with 1 minute
        if (currentTime - item.lastAttempt < backoffTime) {
          continue;
        }
        
        try {
          // Check if file still exists
          const fileInfo = await FileSystem.getInfoAsync(item.imageUri);
          if (!fileInfo.exists) {
            successfulUploads.push(i); // Remove from queue if file doesn't exist
            continue;
          }
          
          const encryptedData = await SecurityService.encryptFile(item.imageUri);
          const uploadResult = await ApiService.uploadImage(encryptedData, {
            timeout: 30000,
            retries: 1, // Single retry for background uploads
          });
          
          if (uploadResult.success) {
            successfulUploads.push(i);
          } else {
            queue[i].retryCount++;
            queue[i].lastAttempt = currentTime;
          }
        } catch (error) {
          queue[i].retryCount++;
          queue[i].lastAttempt = currentTime;
          console.error(`Retry failed for item ${i}:`, error);
        }
      }
      
      // Remove successful uploads from queue
      const updatedQueue = queue.filter((_, index) => !successfulUploads.includes(index));
      
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'retry_queue.json',
        JSON.stringify(updatedQueue)
      );
      
      return {
        processed: queue.length,
        successful: successfulUploads.length,
        remaining: updatedQueue.length,
      };
    } catch (error) {
      console.error('Failed to retry uploads:', error);
      return { processed: 0, successful: 0, remaining: 0 };
    }
  };

  const clearRetryQueue = async () => {
    try {
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'retry_queue.json',
        '[]'
      );
    } catch (error) {
      console.error('Failed to clear retry queue:', error);
    }
  };

  const getRetryQueueStatus = async () => {
    try {
      const retryQueue = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + 'retry_queue.json'
      ).catch(() => '[]');
      
      const queue = JSON.parse(retryQueue);
      return {
        totalItems: queue.length,
        pendingRetries: queue.filter((item: any) => item.retryCount < (item.maxRetries || maxRetries)).length,
        failedItems: queue.filter((item: any) => item.retryCount >= (item.maxRetries || maxRetries)).length,
      };
    } catch (error) {
      console.error('Failed to get retry queue status:', error);
      return { totalItems: 0, pendingRetries: 0, failedItems: 0 };
    }
  };

  return {
    captureImage,
    uploadImage,
    isUploading,
    uploadProgress,
    captureAttempts,
    retryFailedUploads,
    clearRetryQueue,
    getRetryQueueStatus,
  };
}