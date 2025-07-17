import { View, Text, ViewStyle } from 'react-native';
import React from 'react';
import { ProfileStatus } from '@/types';
import { Avatar } from './Avatar';
import { bgPrimarColor } from '@/utils/colors';
import {
  AntDesign,
  FontAwesome,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';

const AvatarWithStatus = ({
  fullname,
  photoURL,
  size = 42,
  status = 'pending',
  statusStyle,
  iconOnly=false,
}: {
  fullname: string;
  photoURL: string;
  size: number;
  status: ProfileStatus;
  statusStyle?: ViewStyle;
  iconOnly?: boolean;
}) => {
  const statusSwitcher = () => {
    switch (status) {
      case 'verified':
        return (
          <>
            <MaterialIcons name="verified" size={iconOnly ? size : 13} color={bgPrimarColor} />
            {!iconOnly && <Text className="text-bgDefault text-xs capitalize ml-1">{status}</Text>}
          </>
        );
      case 'cancelled':
      case 'deleted':
        return (
          <>
            <FontAwesome name="times-circle" size={iconOnly ? size : 13} color={bgPrimarColor} />
            {!iconOnly && <Text className="text-red-700 text-xs capitalize ml-1">{status}</Text>}
          </>
        );
      case 'unverified':
        return (
          <>
            <Octicons name="unverified" size={iconOnly ? size : 13} color={bgPrimarColor} />
            {!iconOnly && <Text className="text-red-600 text-xs capitalize ml-1">{status}</Text>}
          </>
        );
      case 'partially':
        return (
          <>
            <MaterialIcons name="av-timer" size={iconOnly ? size : 13} color={bgPrimarColor} />
            {!iconOnly && <Text className="text-yellow-200 text-xs capitalize ml-1">{status}</Text>}
          </>
        );
      default:
        return (
          <>
            <AntDesign name="warning" size={iconOnly ? size : 13} color={bgPrimarColor} />
            {!iconOnly && <Text className="text-red-600 text-xs capitalize ml-1">{status}</Text>}
          </>
        );
    }
  };

  if(iconOnly) return statusSwitcher()

  return (
    <View className="relative">
      <Avatar source={photoURL} name={fullname} size={size} />

      <View className="flex-row rounded-full bg-gray-50 p-1 absolute bottom-0 -right-2" style={statusStyle}>
        {statusSwitcher()}
      </View>
    </View>
  );
};

export default AvatarWithStatus;
