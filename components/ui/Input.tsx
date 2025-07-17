import { ReactElement, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';

interface InputProps {
  label?: string;
  labelElement?: ReactElement;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  ViewStyle?: StyleProp<ViewStyle>;
  classStyle?: string;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  maxLength?: number;
  ref?: React.Ref<TextInput>;
  borderColor?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
}

export function Input({
  label,
  labelElement,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  returnKeyType = 'done',
  autoCapitalize = 'none',
  autoCorrect = false,
  disabled = false,
  icon,
  style,
  ViewStyle,
  classStyle,
  inputStyle,
  labelStyle,
  onSubmitEditing,
  blurOnSubmit = true,
  maxLength,
  onBlur,
  onFocus,
  readOnly=false,
}: InputProps ) {
  const { colors } = useThemeStore();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, style]} className={classStyle}>
      {labelElement ? labelElement : label && (
        <Text style={[styles.label, { color: colors.text }, labelStyle]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.card,
          },
          disabled && styles.disabledInput,
          ViewStyle
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              height: multiline ? 20 * numberOfLines : 40,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '80'}
          secureTextEntry={actualSecureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          maxLength={maxLength}
          onBlur={onBlur}
          onFocus={onFocus}
          readOnly={readOnly}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.toggleButton}
          >
            {isPasswordVisible ? (
              <Feather name="eye-off" size={20} color={colors.text + '80'} />
            ) : (
              <Feather name="eye" size={20} color={colors.text + '80'} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}


export function InputOtp({
  value,
  onChangeText,
  secureTextEntry = true,
  keyboardType = 'numeric',
  borderColor = '#ccc',
  maxLength,
  ref,
}: InputProps) {
  return (
    <TextInput
      ref={ref}
      style={{
        color: 'black',
        width: 50,
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        borderColor: borderColor,
      }}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      maxLength={maxLength}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.6,
  },
  toggleButton: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
});
