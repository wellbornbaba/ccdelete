import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  useDerivedValue
} from 'react-native-reanimated';
import { FaceGuideBoxProps } from '@/types/face-detection';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GUIDE_BOX_WIDTH = SCREEN_WIDTH * 0.7;
const GUIDE_BOX_HEIGHT = GUIDE_BOX_WIDTH * 1.3;

export const FaceGuideBox: React.FC<FaceGuideBoxProps> = ({ isAligned, face }) => {
  const alignmentProgress = useSharedValue(0);

  React.useEffect(() => {
    alignmentProgress.value = withSpring(isAligned ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isAligned]);

  const borderColor = useDerivedValue(() => {
    return interpolateColor(
      alignmentProgress.value,
      [0, 1],
      ['#EF4444', '#10B981'] // red to green
    );
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: borderColor.value,
      borderWidth: withSpring(isAligned ? 3 : 2),
      transform: [
        {
          scale: withSpring(isAligned ? 1.02 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isAligned ? 0.1 : 0.3),
    };
  });

  return (
    <View style={styles.container}>
      {/* Dark overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]} />
      
      {/* Guide box */}
      <Animated.View style={[styles.guideBox, animatedStyle]}>
        {/* Corner indicators */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        
        {/* Face detection overlay */}
        {face && (
          <Animated.View
            style={[
              styles.faceOverlay,
              {
                left: face.bounds.origin.x - (SCREEN_WIDTH - GUIDE_BOX_WIDTH) / 2,
                top: face.bounds.origin.y - (SCREEN_HEIGHT - GUIDE_BOX_HEIGHT) / 2,
                width: face.bounds.size.width,
                height: face.bounds.size.height,
              },
              animatedStyle,
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  guideBox: {
    width: GUIDE_BOX_WIDTH,
    height: GUIDE_BOX_HEIGHT,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 20,
  },
  faceOverlay: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
});