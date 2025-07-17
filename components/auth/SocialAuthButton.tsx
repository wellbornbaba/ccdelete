import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { SocialAuthProvider } from '@/types/auth';

interface SocialAuthButtonProps {
  provider: SocialAuthProvider;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SocialAuthButton({ 
  provider, 
  onPress, 
  isLoading = false, 
  disabled = false 
}: SocialAuthButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: provider.bgColor },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color={provider.color} />
        ) : (
          <Text style={styles.icon}>{provider.icon}</Text>
        )}
        <Text style={[styles.text, { color: provider.color }]}>
          Continue with {provider.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  disabled: {
    opacity: 0.6,
  },
});