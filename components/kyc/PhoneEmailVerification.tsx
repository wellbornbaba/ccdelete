import { View, Text, TouchableOpacity, Keyboard, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { User } from '@/types';

type typeProps = 'phone' | 'email';
const PhoneEmailVerification = (
  { user, closeModal, type = 'phone' }: { user: User, closeModal: () => void ,
  type?: typeProps}
) => {

  return (
    <View>
      <Text>Phone Verification</Text>
    </View>
  );
};

export default PhoneEmailVerification;
