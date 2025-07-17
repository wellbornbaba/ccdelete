import { View, Text, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Image } from 'react-native'
import React, { ReactElement } from 'react'
import { Picker, PickerProps } from "@react-native-picker/picker";
import tw from 'twrnc'
import { useThemeStore } from '@/store/useThemeStore';

declare interface pickerData {
  label: any;
  value: any;
}

interface SelectFieldProps extends PickerProps {
  label?: string;
  iconLeft?: any;
  iconLeftElement?: ReactElement;
  iconRightElement?: ReactElement;
  iconRight?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
  defaultInputType?: pickerData;
  inputType?: pickerData[];
  selectedValue?: any;
  error?: string; // Add this to include an optional error property
}


export const SelectField = ({
  label,
  labelStyle,
  iconLeftElement,
  iconLeft,
  iconRight,
  iconRightElement,
  containerStyle,
  iconStyle,
  defaultInputType,
  inputType,
  error,
  ...props
}: SelectFieldProps) => {
const colors = useThemeStore(s => s.colors)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full ">
          {label && (
            <Text
              className={`text-base font-semibold mb-1 ${labelStyle}`}
              style={{ color: colors.text }}
            >
              {label}
            </Text>
          )}
          <View
            style={tw`bg-neutral-100 rounded-lg border border-neutral-100 pl-6 ${containerStyle || ""}`}
          >
            {iconLeftElement && iconLeftElement}
            {iconLeft && (
              <Image source={iconLeft} className={`w-6 h-6 ml-0 ${iconStyle}`} />
            )}
           
              <Picker
              style={{paddingVertical:0, marginVertical: 0}}
                {...props}
              >
                {defaultInputType ? <Picker.Item
                    label={defaultInputType.label}
                    value={defaultInputType.value}
                  /> : null}

                {inputType?.map((item: pickerData, index) => (
                  <Picker.Item style={{fontSize: 14}}
                    label={item.label}
                    value={item.value}
                    key={index.toString()}
                  />
                ))}
              </Picker>
              
            {iconRight && (
              <Image source={iconRight} className={`w-6 h-6 mr-4 ${iconStyle}`} />
            )}
            {iconRightElement && iconRightElement}
          </View>
          {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};