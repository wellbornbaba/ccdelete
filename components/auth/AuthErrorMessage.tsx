import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AuthErrorMessageProps {
  error: string;
  onDismiss?: () => void;
}

export function AuthErrorMessage({ error }: AuthErrorMessageProps) {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <Feather name="alert-circle" size={20} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
});