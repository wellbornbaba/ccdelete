import { Animated, Easing, View, Image } from 'react-native';
import { useRef, useEffect } from 'react';

export default function SpiralCheck() {
  
  return (
    <View className="items-center justify-center my-6">
      <Animated.View
        className="bg-green-300 p-2 rounded-full"
      >
        <Animated.View
          className="bg-green-400 p-2 rounded-full"
        >
          <View className="bg-green-600 p-4 rounded-full">
            <Image
              source={require('@/assets/icons/check.png')}
              className="w-[110px] h-[110px]"
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
