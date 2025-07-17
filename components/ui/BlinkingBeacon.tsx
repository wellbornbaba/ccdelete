import React, { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Image,
  View,
  Text,
  ImageSourcePropType,
  Pressable,
} from 'react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BlinkingBeaconProps {
  size?: number;
  imageSize?: number;
  imageSrc?: ImageSourcePropType;
  name?: string;
  color?: string;
  pulseColor?: string;
  duration?: number;
  borderWidth?: number;
  onPress?: () => void;
}

export const BlinkingBeacon = ({
  size = 30,
  color = '#00f', // default blue
  pulseColor = '#00f',
  duration = 1000,
  imageSize = 40,
  imageSrc,
  name,
  borderWidth = 2,
  onPress,
}: BlinkingBeaconProps) => {
  const radius = useSharedValue(0.8);
  const opacity = useSharedValue(1);

  useEffect(() => {
    radius.value = withRepeat(withTiming(1.5, { duration }), -1, true);
    opacity.value = withRepeat(withTiming(0, { duration }), -1, true);
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    r: (size / 2) * radius.value,
    opacity: opacity.value,
  }));

  if (imageSrc) {
    return (
      <View className="items-center justify-center">
        <Pressable onPress={onPress}>
          <View
            className="items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Svg width={size} height={size}>
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                fill={pulseColor}
                animatedProps={animatedProps}
              />
            </Svg>

            <View
              className="absolute"
              style={{
                width: imageSize + borderWidth * 2,
                height: imageSize + borderWidth * 2,
                borderRadius: (imageSize + borderWidth * 2) / 2,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={imageSrc}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize / 2,
                }}
              />
            </View>
          </View>
        </Pressable>

        {name && (
          <Text
            className="text-xs text-gray-700 mt-1 font-medium"
            numberOfLines={1}
          >
            {name}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View>
      <Svg
        width={size * 2}
        height={size * 2}
        viewBox={`0 0 ${size * 2} ${size * 2}`}
      >
        {/* Pulsing Outer Circle */}
        <AnimatedCircle
          cx={size}
          cy={size}
          fill={pulseColor}
          animatedProps={animatedProps}
        />

        {/* Solid Inner Beacon */}
        <Circle cx={size} cy={size} r={size / 4} fill={color} />
      </Svg>
    </View>
  );
};
