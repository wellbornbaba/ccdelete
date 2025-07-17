import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import type { FaceFeature } from 'expo-face-detector';
import * as FileSystem from 'expo-file-system';
import { Feather, Ionicons } from '@expo/vector-icons';
import { User } from '@/types';
import { bgPrimarColor, textGrayColor } from '@/utils/colors';
import { BASEURL } from '@/utils/fetch';
import { Button } from '../ui/Button';

// Replace this line:
// import { Camera, FaceDetectionResult } from 'expo-camera';
type FaceDetectionEvent = {
  faces: FaceFeature[];
};

// With this type definition:
type FaceDetectionResult = {
  faces: Array<{
    faceID: number;
    bounds: {
      origin: {
        x: number;
        y: number;
      };
      size: {
        width: number;
        height: number;
      };
    };
    smilingProbability?: number;
    leftEarPosition?: { x: number; y: number };
    rightEarPosition?: { x: number; y: number };
    leftEyePosition?: { x: number; y: number };
    rightEyePosition?: { x: number; y: number };
    leftCheekPosition?: { x: number; y: number };
    rightCheekPosition?: { x: number; y: number };
    leftMouthPosition?: { x: number; y: number };
    rightMouthPosition?: { x: number; y: number };
    noseBasePosition?: { x: number; y: number };
  }>;
};

interface SelfieVerificationProps {
  user: User;
}

type VerificationStatus =
  | 'idle'
  | 'detecting'
  | 'capturing'
  | 'captured'
  | 'uploading'
  | 'success'
  | 'failed';

const { width, height } = Dimensions.get('window');
const circleSize = width * 0.7;

const SelfieVerification: React.FC<SelfieVerificationProps> = ({ user }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facesDetected, setFacesDetected] = useState<FaceFeature[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [faceInFrame, setFaceInFrame] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to verify your identity. Please enable camera permissions in your device settings.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission.');
    }
  };

  useEffect(() => {
    requestCameraPermission();

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, []);

  const handleFacesDetected = (result: { faces: Array<any> }) => {
    const faces = result.faces;
    setFacesDetected(faces);
    const hasValidFace = faces.length === 1 && isFaceInCircle(faces[0]);
    setFaceInFrame(hasValidFace);

    if (hasValidFace && verificationStatus === 'detecting' && !countdown) {
      startCountdown();
    }
  };

    const isFaceInCircle = (face: FaceFeature) => {
    return (
      face.bounds.origin.x > width / 2 - circleSize / 2 &&
      face.bounds.origin.x + face.bounds.size.width < width / 2 + circleSize / 2 &&
      face.bounds.size.width > 100
    );
  };

  const startCountdown = () => {
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }

    setCountdown(3);

    const runCountdown = (count: number) => {
      if (count > 0) {
        setCountdown(count);
        countdownRef.current = setTimeout(() => runCountdown(count - 1), 1000);
      } else {
        setCountdown(null);
        takeSelfie();
      }
    };

    runCountdown(3);
  };

  const takeSelfie = async () => {
    if (!cameraRef.current) return;

    try {
      setVerificationStatus('capturing');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      setCapturedPhoto(photo.uri);
      setVerificationStatus('captured');
    } catch (error) {
      console.error('Error taking selfie:', error);
      Alert.alert('Error', 'Failed to capture selfie. Please try again.');
      setVerificationStatus('idle');
    }
  };

  const uploadSelfie = async () => {
    if (!capturedPhoto || !user?.id) return;

    setIsLoading(true);
    setVerificationStatus('uploading');

    try {
      const apiUrl = `${BASEURL}/api/uploads/kyc`;

      const uploadResult = await FileSystem.uploadAsync(apiUrl, capturedPhoto, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'uploadfile',
        parameters: {
          userid: user.id,
          kyctype: 'selfie_verification',
          position: 'front',
          features: 'selfie',
        },
      });

      const response = JSON.parse(uploadResult.body);

      if (response.status === 'success') {
        setVerificationStatus('success');
        Alert.alert('Success', 'Selfie verification completed successfully!', [
          { text: 'OK' },
        ]);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading selfie:', error);
      setVerificationStatus('failed');
      Alert.alert(
        'Upload Failed',
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retakeSelfie = () => {
    setCapturedPhoto(null);
    setVerificationStatus('idle');
    setFaceInFrame(false);
    setCountdown(null);
  };

  const startVerification = () => {
    setVerificationStatus('detecting');
  };

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Feather name="camera-off" size={64} color={textGrayColor} />
        <Text className="text-lg font-semibold mt-4 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-gray-600 text-center mt-2 mb-6">
          Please enable camera permissions to verify your identity.
        </Text>
        <Button
          title="Request Permission"
          onPress={requestCameraPermission}
          icon={<Ionicons name="camera" size={20} color="white" />}
        />
      </View>
    );
  }

  if (hasPermission === null) {
    return <View className="flex-1 bg-white" />;
  }

  if (verificationStatus === 'success') {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        <Text className="text-xl font-semibold mt-4 text-center">
          Verification Successful!
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Your selfie has been successfully verified and submitted.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {capturedPhoto ? (
        <Image
          source={{ uri: capturedPhoto }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      type={CameraType.front}
      onFacesDetected={verificationStatus === 'detecting' ? handleFacesDetected : undefined}
      faceDetectorSettings={{
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
        minDetectionInterval: 100,
        tracking: true,
      }}
    >
      )}

      {/* Overlay */}
      <View className="flex-1 justify-center items-center">
        {/* Face detection overlay */}
        {verificationStatus === 'detecting' && !capturedPhoto && (
          <View
            className={`rounded-full border-4 ${
              faceInFrame ? 'border-green-500' : 'border-white'
            }`}
            style={{
              width: circleSize,
              height: circleSize,
              backgroundColor: 'transparent',
              borderStyle: 'dashed',
              position: 'absolute',
            }}
          />
        )}

        {/* Countdown */}
        {countdown && (
          <View className="absolute justify-center items-center">
            <Text className="text-6xl font-bold text-white">{countdown}</Text>
          </View>
        )}

        {/* Instructions */}
        <View className="absolute top-20 left-0 right-0 px-6">
          <View className="bg-black/50 p-4 rounded-lg">
            <Text className="text-white text-center font-semibold">
              {verificationStatus === 'idle' &&
                'Position your face in the frame'}
              {verificationStatus === 'detecting' &&
                !faceInFrame &&
                'Move closer and look directly at the camera'}
              {verificationStatus === 'detecting' &&
                faceInFrame &&
                'Hold still, capturing in...'}
              {verificationStatus === 'captured' &&
                'Selfie captured successfully!'}
              {verificationStatus === 'capturing' && 'Capturing...'}
              {verificationStatus === 'uploading' && 'Uploading...'}
              {verificationStatus === 'failed' &&
                'Verification failed. Please try again.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom controls */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        {verificationStatus === 'idle' && (
          <Button
            title="Start Verification"
            onPress={startVerification}
            icon={<Ionicons name="camera" size={20} color="white" />}
          />
        )}

        {verificationStatus === 'captured' && (
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={retakeSelfie}
              className="flex-1 bg-gray-600 py-3 rounded-lg flex-row justify-center items-center"
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={uploadSelfie}
              disabled={isLoading}
              className="flex-1 bg-green-600 py-3 rounded-lg flex-row justify-center items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {verificationStatus === 'failed' && (
          <Button
            title="Try Again"
            onPress={retakeSelfie}
            icon={<Ionicons name="refresh" size={20} color="white" />}
          />
        )}
      </View>
    </View>
  );
};

export default SelfieVerification;
