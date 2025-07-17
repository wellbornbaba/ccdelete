import { View, Text } from 'react-native';
import React, { ReactNode } from 'react';
import ReactNativeModal from 'react-native-modal';
import SpiralCheck from './SpiralCheck';
import { useThemeStore } from '@/store/useThemeStore';

interface ModalConfirmProps {
  title: string;
  subtitle: string;
  btnReact: ReactNode;
  showSuccessModal: boolean;
}

const ModalConfirm = ({
  showSuccessModal,
  title,
  subtitle,
  btnReact,
}: ModalConfirmProps) => {
  const { colors } = useThemeStore();

  return (
    <>
      {showSuccessModal && (
        <View className="top-0 left-0 right-0 bottom-0 absolute bg-black/60 z-50">
          <ReactNativeModal isVisible={showSuccessModal}>
            <View
              style={{
                backgroundColor: colors.background
              }}
              className=" px-7 py-9 rounded-2xl min-h-[300px] w-[90%]"
            >
              <SpiralCheck />

              <Text
                style={{ color: colors.text }}
                className="text-2xl font-['Inter-Bold'] text-center"
              >
                {title}
              </Text>
              <Text
                style={{ color: colors.gray }}
                className="text-base font-['Inter-Regular'] text-center mt-2"
              >
                {subtitle}
              </Text>
              {btnReact && btnReact}
              {/* <Button
                     title="Browse Dashboard"
                     onPress={() => {
                       router.replace('/(root)/(tabs)');
                       setUserSignUpData(null);
                     }}
                     classStyle="mt-5"
                   /> */}
            </View>
          </ReactNativeModal>
        </View>
      )}
    </>
  );
};

export default ModalConfirm;
