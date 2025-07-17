import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  interpolate
} from 'react-native-reanimated';

interface CountdownOverlayProps {
  countdown: number | null;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ countdown }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (countdown !== null) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [countdown]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const pulse = interpolate(
      scale.value,
      [0, 1, 1.2],
      [0, 1, 0.8]
    );
    
    return {
      transform: [{ scale: pulse }],
    };
  });

  if (countdown === null) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.countdownContainer, animatedStyle]}>
        <Animated.View style={[styles.countdownCircle, pulseStyle]}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </Animated.View>
        <Text style={styles.captureText}>Get Ready!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  captureText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
});