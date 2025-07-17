import React, { ReactElement, useRef } from 'react';
import {
  Animated,
  PanResponder,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { BlinkingBeacon } from './BlinkingBeacon';
import { bgPrimarColor } from '@/utils/colors';

interface DraggableTripMonitorProps {
  message: ReactElement;
  innerColor: string;
  outerColor: string;
  onPress: () => void;
}

export default function DraggableTripMonitor({message, innerColor, outerColor, onPress} : DraggableTripMonitorProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.extractOffset(); // sets offset to current value and resets value to zero
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset(); // combine value and offset
      },
    })
  ).current;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 130,
        right: 16,
        zIndex: 50,
        transform: pan.getTranslateTransform(),
      }}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        className="rounded-full w-20 h-20 p-1 justify-center items-center"
        onPress={onPress}
        style={{
          backgroundColor: '#07657250',
        }}
      >
        {/* <BlinkingBeacon
          size={30}
          color="#22c55e60"
          pulseColor={bgPrimarColor}
          duration={800}
        /> */}
        <BlinkingBeacon
          size={30}
          color={outerColor}
          pulseColor={innerColor}
          duration={800}
        />
        {message}
        {/* <View className="-top-5 justify-center items-center">
          <Text className="text-default-900 font-bold text-xs ">Trip</Text>
          <Text className="text-default-900 font-bold text-xs ">monitor</Text>
        </View> */}
      </TouchableOpacity>
    </Animated.View>
  );
}
