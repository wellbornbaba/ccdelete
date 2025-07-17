import { View, Text, TouchableOpacity, ReactNode } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { textGrayColor } from '@/utils/colors';
import { useThemeStore } from '@/store/useThemeStore';

type PillCardProps = {
  leftElement?: ReactNode;
  title: string | ReactNode;
  rightElement?: ReactNode;
  removeBorder?: boolean;
  onpress?: () => void; 
};

const PillCardSetting = ({
  leftElement,
  title,
  rightElement,
  onpress,
  removeBorder = false,
}: PillCardProps) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity 
      onPress={onpress} 
      className={`flex-row justify-between items-center py-4 px-2 ${!removeBorder && 'border-b'}`}
      style={{
        borderBottomColor: !removeBorder ? colors.border : 'transparent'
      }}
    >
      <View className="flex-row items-center flex-1">
        {leftElement && (
          <View className="w-10 h-10 rounded-full justify-center items-center mr-3"
            style={{ backgroundColor: colors.background }}
          >
            {leftElement}
          </View>
        )}
        {typeof title === 'string' ? (
          <Text className="text-base font-medium" style={{ color: colors.text }}>
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <AntDesign name="right" size={20} color={textGrayColor} />
      )}
    </TouchableOpacity>
  );
};

export default PillCardSetting;