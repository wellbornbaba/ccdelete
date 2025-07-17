import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeStore } from '@/store/useThemeStore';

interface GenderToggleProps {
  label?: string;
  value: 'passenger' | 'driver';
  onChange: (val: 'passenger' | 'driver') => void;
}

const SwitchToggle: React.FC<GenderToggleProps> = ({ label, value, onChange }) => {
  const { colors } = useThemeStore();
  const options: ('passenger' | 'driver')[] = ['passenger', 'driver'];

  return (
    <View className="my-4">
      {label && (
        <Text
          style={{ color: colors.gray }}
          className="text-md font-semibold mb-2">
          {label}
        </Text>
      )}

      <View className="flex-row justify-start">
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{backgroundColor: value === option ? colors.primary : 'white', borderColor: value === option ? colors.primary : colors.gray}}
            className={`px-6 py-2 mr-6 rounded-full border-2`}
          >
            <Text
              className={`text-sm font-bold ${
                value === option ? 'text-white' : 'text-gray-700'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default SwitchToggle;
