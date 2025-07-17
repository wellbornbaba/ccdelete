import { View, Text } from 'react-native';
import React from 'react';
import { User } from '@/types';
import { KYCColor } from '@/utils';

const KYCard = ({ user }: { user: User }) => {
  const noOfKYC = user.kycScore?.noVerified || 0;
  const KYCScores = user.kycScore?.score || 1;
  const KYCStatus = user.kycScore?.status || 'unverified';
  const KYCColorActive = KYCColor(noOfKYC);

  return (
    <View className={` gap-2 ${KYCColorActive.bg} p-3 rounded-2xl flex-1`}>
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-['Inter-SemiBold'] text-white">
          KYC Verification
        </Text>
        <Text className="text-base font-['Inter-SemiBold'] text-white">
          {noOfKYC}/5
        </Text>
      </View>

      <View
        className={`w-1/3 p-1 rounded-3xl justify-center items-center ${KYCColorActive.bg}`}
        //  style={{
        //     width: `${KYCScores}%`
        //   }}
      >
        <Text className="text-white font-thin text-xs capitalize">
          {KYCScores}% {KYCStatus}
        </Text>
      </View>
      <View className="h-2 bg-white rounded-3xl w-full flex-1">
        <View
          className={`h-2 bg-default-900 rounded-3xl`}
          style={{
            width: `${KYCScores}%`,
          }}
        />
      </View>
      <Text className={`text-sm font-thin capitalize text-white`}>
        Verification {KYCStatus}
      </Text>
    </View>
  );
};

export default KYCard;
