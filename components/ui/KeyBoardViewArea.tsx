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
}>;

export function KeyBoardViewArea({
  children,
  useScroll = false,
  offset = Platform.OS === 'ios' ? 100 : 0,
  scrollViewProps,
}: KeyboardViewProps) {
  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={offset}
    >
        {useScroll ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 } as ViewStyle}
            keyboardShouldPersistTaps="handled"
            className="p-4"
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        ) : (
          <>{children}</>
        )}
    </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
  );
}
