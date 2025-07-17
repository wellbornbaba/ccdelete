import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeAppStore } from '@/store/useThemeAppStore';

const { width: screenWidth } = Dimensions.get('window');

interface CaptureButtonProps {
  onPress: () => void;
  disabled: boolean;
  isCapturing: boolean;
  isUploading: boolean;
}

export function CaptureButton({
  onPress,
  disabled,
  isCapturing,
  isUploading,
}: CaptureButtonProps) {
  const { colors } = useThemeAppStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCapturing || isUploading) {
      // Start rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        rotateAnimation.stop();
      };
    } else {
      rotateAnim.setValue(0);
    }
  }, [isCapturing, isUploading]);

  useEffect(() => {
    if (!disabled && !isCapturing && !isUploading) {
      // Pulse animation when ready to capture
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [disabled, isCapturing, isUploading]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonColor = (): string => {
    if (disabled) return '#9ca3af';
    if (isCapturing) return '#ffa726';
    if (isUploading) return '#2196f3';
    return colors.primary;
  };

  const getButtonText = (): string => {
    if (isCapturing) return 'Capturing...';
    if (isUploading) return 'Uploading...';
    if (disabled) return 'Position Face';
    return 'Capture';
  };

  const getButtonIcon = (): string => {
    if (isCapturing) return 'camera';
    if (isUploading) return 'cloud-upload';
    return 'camera';
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: getButtonColor(),
              opacity: disabled ? 0.6 : 1,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <Ionicons
              name={getButtonIcon() as any}
              size={32}
              color="#fff"
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <Text style={[styles.buttonText, { color: colors.text }]}>
        {getButtonText()}
      </Text>

      {/* Progress indicator */}
      {(isCapturing || isUploading) && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getButtonColor(),
                  width: isCapturing ? '50%' : '100%',
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressContainer: {
    marginTop: 12,
    width: screenWidth * 0.6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});