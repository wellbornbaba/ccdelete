import { View, Text } from 'react-native';
import React from 'react';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';

const OAuth = () => {
    const {colors} = useThemeStore()
    
  return (
    <>
      <View className="py-2 w-full items-center justify-center my-8">
        <View className="border border-gray-200 w-full" />
        <Text
          style={{ color: colors.gray }}
          className={`absolute bg-white p-2 z-20 mt-1 `}
        >
          or continue with
        </Text>
      </View>

      <View className="py-2 w-full flex-row items-center justify-center mb-8 gap-4">
        <View className="border-gray-200 rounded-lg border p-3 items-center justify-center">
          <FontAwesome5 name="google" size={24} color="red" />
        </View>
        <View className="border-gray-200 rounded-lg border p-3 items-center justify-center">
          <AntDesign name="apple1" size={24} color="black" />
        </View>
        <View className="border-gray-200 rounded-lg border p-3 items-center justify-center">
          <AntDesign name="facebook-square" size={24} color="blue" />
        </View>
      </View>
    </>
  );
};

export default OAuth;
