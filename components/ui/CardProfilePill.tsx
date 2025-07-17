import { View, Text } from 'react-native';
import React, { ReactNode } from 'react';

export default function CardProfilePill({
  title,
  subtitle,
  icon,
  righticon,
}: {
  title?: string;
  subtitle?: string;
  icon: ReactNode;
  righticon?: ReactNode;
}) {
  return (
    <View className="flex-row items-start mb-3 gap-2">
      {icon}
      <View className="gap-1">
        {title && <Text className="text-gray-400">{title}</Text>}
        {subtitle && <Text className="text-gray-700">{subtitle}</Text>}
      </View>
      {righticon}
    </View>
  );
}
