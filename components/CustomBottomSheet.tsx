import React, { useRef, useEffect } from "react";
import { Animated, Pressable, ScrollView, View } from "react-native";
import tw from "twrnc";

interface BottomSheetProps {
  isVisible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  mainClass?: any;
  enableScrowView?: boolean;
}

const CustomBottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  children,
  mainClass,
  enableScrowView
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0], // Moves up from 300px below
  });

  if (!isVisible) return null; // Prevent rendering when not visible

  return (
    <View pointerEvents="box-none" className="flex-1 absolute top-0 bottom-0 left-0 right-0  w-full h-full">
      <Pressable
        style={tw`absolute top-0 left-0 right-0 bottom-0 bg-black/65 w-full h-full`}
        onPress={onClose} // Close when tapping outside
      />
  
      <Animated.View
        style={[tw`${mainClass}`, { transform: [{ translateY }] }]}
        className="absolute bottom-0 bg-white rounded-t-2xl shadow-lg px-2 w-full h-full flex-1 z-50"
      >
        {enableScrowView  ? <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {children}
        </ScrollView> : <>{children}</> }
      </Animated.View>
    </View>
  );
  
  
};

export default CustomBottomSheet;
