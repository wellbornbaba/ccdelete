import { bgPrimarColor } from '@/utils/colors';
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Alert } from 'react-native';


const OnlineOfflineToggle = () => {
  const [isOnline, setIsOnline] = useState(true);
  const toggleAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = isOnline ? 1 : 0;
    Animated.timing(toggleAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.exp),
    }).start();
    setIsOnline(!isOnline);
  };

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // Adjust depending on width
  });

  const handleToggle = () => {
    Alert.prompt("Warning", "Are you sure you want to go offline?");
    toggle()
  }

  return (
    <View className="bg-gray-100 p-1 rounded-full  flex-row items-center justify-between relative overflow-hidden ">
      <Animated.View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: 9999,
        //   backgroundColor: bgPrimarColor,
          transform: [{ translateX }],
        }}
      />
      
      <TouchableOpacity
        onPress={handleToggle}
        className="px-4 py-1 rounded-full z-10"
        style={{
            backgroundColor: isOnline ? bgPrimarColor : "transparent"
        }}
      >
        <Text className={`self-center ${isOnline ? 'text-white font-bold ' : 'text-black'}`}>Online</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleToggle}
        className="px-4 py-1 rounded-full z-10 "
        style={{
            backgroundColor: !isOnline ? bgPrimarColor : "transparent"
        }}
      >
        <Text className={`self-center ${!isOnline ? 'text-white font-bold ' : 'text-black'}`}>Offline</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnlineOfflineToggle;
