import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { DriverBankDetail } from '@/types';
import { Card } from './Card';
import {  FontAwesome } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';

const BankAccountCard = ({ bankItem }: { bankItem: DriverBankDetail }) => {
  const colors = useThemeStore((state) => state.colors);

  return (
    <Card classStyle=" gap-2 mt-2" elevation={0}>
      <View className="p-3 gap-2">
        <View className="flex-row justify-between ">
          <View className="flex-row items-center gap-3">
            <FontAwesome name="bank" size={24} color={colors.gray} />
            <Text
              style={{
                color: colors.text,
              }}
              className={"capitalize text-xl font-['Inter-SemiBold'] "}
            >
              {bankItem.bank_name}
            </Text>
          </View>

          <View className="flex-row">
            <Text className="text-success-800 text-sm">
              {bankItem.dstatus ? 'Default | ' : ''}
            </Text>

            <TouchableOpacity onPress={() => {}}>
              <Text className="text-success-500 text-sm m1-4">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="gap-2 flex-row ">
          <Text
            style={{
              color: colors.gray,
            }}
            className={"capitalize text-sm font-['Inter-SemiBold'] "}
          >
            Account Number: 
          </Text>
          <Text
            style={{
              color: colors.gray,
            }}
            className={"capitalize text-sm font-['Inter-SemiBold'] "}
          >
            {bankItem.account_number}
          </Text>
        </View>
        <View className="gap-2  flex-row ">
          <Text
            style={{
              color: colors.gray,
            }}
            className={"capitalize text-sm font-['Inter-SemiBold'] "}
          >
            Account Name: 
          </Text>
          <Text
            style={{
              color: colors.gray,
            }}
            className={"capitalize text-sm font-['Inter-SemiBold'] "}
          >
            {bankItem.account_name}
          </Text>
        </View>
        <View className="gap-2  flex-row ">
          <Text
            style={{
              color: colors.gray,
            }}
            className={"capitalize text-sm font-['Inter-SemiBold'] "}
          >
            Account Type: 
          </Text>
          <Text
            style={{
              color: colors.gray,
            }}
            className={"capitalize text-sm font-['Inter-SemiBold'] "}
          >
            {bankItem.account_type}
          </Text>
        </View>
      </View>
    </Card>
  );
};

export default BankAccountCard;
