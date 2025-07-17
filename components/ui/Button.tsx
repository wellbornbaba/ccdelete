import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/useThemeStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  classStyle?: string;
  textStyle?: StyleProp<TextStyle>;
  gradientColors?: string[];
}

export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconRight,
  style,
  classStyle,
  textStyle,
  gradientColors,
  ...props
}: ButtonProps) {
  const { colors, gradients } = useThemeStore();

  const isDisabled = disabled || isLoading;

  // Set appropriate colors based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'filled':
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  // Set text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      case 'filled':
      default:
        return '#FFFFFF';
    }
  };

  // Set sizes based on the size prop
  const getSize = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 14,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 16,
        };
    }
  };

  const buttonSize = getSize();
  const buttonStyles = getButtonStyles();
  const textColor = getTextColor();

  const renderButtonContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentContainer}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  { color: textColor, fontSize: buttonSize.fontSize },
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {iconRight && (
                <View style={styles.iconContainer}>{iconRight}</View>
              )}
        </View>
      )}
    </>
  );

  if (variant === 'filled' && !isDisabled) {
    const colors = (gradientColors || gradients.primary) as [
      string,
      string,
      ...string[],
    ];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.container, style]}
        className={`${classStyle}`}
        {...props}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            buttonStyles,
            {
              paddingVertical: buttonSize.paddingVertical,
              paddingHorizontal: buttonSize.paddingHorizontal,
            },
          ]}
        >
          {renderButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      className={`${classStyle}`}
      style={[
        styles.container,
        styles.button,
        buttonStyles,
        {
          paddingVertical: buttonSize.paddingVertical,
          paddingHorizontal: buttonSize.paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
});
