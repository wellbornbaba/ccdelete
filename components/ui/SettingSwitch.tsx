import React from 'react';
import { View, Text, Switch } from 'react-native';
import { ViewProps } from 'react-native';

interface Props extends ViewProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  icon?: React.ReactNode;
}

export const SettingSwitch: React.FC<Props> = ({ label, value, onChange, icon, ...props }) => {
  return (
    <View className="flex-row justify-between items-center bg-gray-100 rounded-xl p-4 mb-3" {...props}>
      <View className="flex-row items-center space-x-3">
        {icon}
        <Text className="text-base text-gray-800">{label}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
};
