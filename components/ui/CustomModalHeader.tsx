import { View, Text, TouchableOpacity } from 'react-native';
import React, { ReactNode } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import tw from "twrnc"
import CustomModal from './CustomModal';
import { bgPrimarColor } from '@/utils/colors';

interface CustomModalHeaderProps {
  children: ReactNode;
  onPress: () => void;
  title: any;
  containerStyle?: any;
  childStyle?: any;
  showInitialModal: boolean;
  modalStyle?: any;
}

export default function CustomModalHeader({ children, onPress, title, containerStyle, childStyle, showInitialModal, modalStyle }: CustomModalHeaderProps) {
  return (
    <CustomModal
      visible={showInitialModal}
      modalContainerStyle={modalStyle}
    >
      <View style={tw`h-auto ${containerStyle}`}>
        <View className="border-b border-b-gray-200 w-full justify-between items-center mb-2 flex-row py-3">
          <Text className="font-bold text-lg">{title}</Text>
          <TouchableOpacity onPress={onPress} className=" rounded-full bg-white">
            <AntDesign name="close" size={20} color={bgPrimarColor} />
          </TouchableOpacity>

        </View>
        <View style={tw`w-full h-auto ${childStyle}`}>{children}</View>

      </View>
    </CustomModal>
  );
}
