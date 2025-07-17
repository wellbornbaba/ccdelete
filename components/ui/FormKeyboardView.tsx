import React, { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollViewProps,
  ViewStyle,
} from 'react-native';

type KeyboardViewProps = PropsWithChildren<{
  useScroll?: boolean;
  offset?: number;
  scrollViewProps?: ScrollViewProps;
  flex1?: boolean;
}>;

export function FormKeyboardView({
  children,
  useScroll = true,
  offset = Platform.OS === 'ios' ? 80 : 20,
  scrollViewProps,
  flex1 = false,
}: KeyboardViewProps) {
  return (
    <KeyboardAvoidingView
        className={`${flex1 ? 'flex-1' : 'flex'}`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={offset}
      >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {useScroll ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 } as ViewStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="p-0"
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
}
