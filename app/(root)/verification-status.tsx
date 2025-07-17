import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/Card';
import {
  MaterialIcons,
  AntDesign,
  Ionicons,
  FontAwesome,
  Entypo,
  FontAwesome5,
} from '@expo/vector-icons';
import { bgPrimarColor } from '@/utils/colors';
import KYCard from '@/components/ui/KYCard';
import { Button } from '@/components/ui/Button';
import { Redirect, router } from 'expo-router';
import PhoneEmailVerification from '@/components/kyc/PhoneEmailVerification';
import GovernmentID from '@/components/kyc/GovernmentID';
import ProofOfAddress from '@/components/kyc/ProofOfAddress';
// import SelfieVerification from '@/components/kyc/SelfieVerification';
import { useLanguageStore } from '@/store/useLanguageStore';
import { postAPI } from '@/utils/fetch';
import { KYCty } from '@/types';

type verifyTypes =
  | 'email'
  | 'phone'
  | 'government_id'
  | 'proof_address'
  | 'selfie_verification'
  | null;

const VerificationStatus = () => {
  const colors = useThemeStore((state) => state.colors);
  const setIsAppLoading = useLanguageStore((s) => s.setIsAppLoading);
  const user = useAuthStore((state) => state.user);
  const signout = useAuthStore((state) => state.signOut);
  const setUser = useAuthStore((state) => state.setUser);
  const [kycVerifyType, setKycVerifType] = useState<verifyTypes>(null);
  if (!user || !user.kycScore){
    signout()
    return <Redirect href={'/(auth)/login-lock'} />;

  }
  const { kycScore } = user;
  const {kyc} = kycScore

  const verificationItems = [
    {
      id: 'phone',
      title: 'Phone Verification',
      status: true,
      onpress: () => {},
      statusState: kyc?.phone ? 'verified' : ('partially' as KYCty),
      description: 'Verify your phone number',
      icon: (
        <FontAwesome
          name="phone"
          size={24}
          color={kyc?.phone ? bgPrimarColor : colors.text + '60'}
        />
      ),
    },
    {
      id: 'government_id',
      title: 'Government ID',
      status: ['inprogress', 'verified'].includes(kyc?.government_id.status ?? "pending")
        ? true
        : false,
      onpress: () => setKycVerifType('government_id'),
      statusState: kyc?.government_id.status,
      description: 'Upload a valid government-issued ID',
      icon: (
        <Entypo
          name="v-card"
          size={24}
          color={
            ['inprogress', 'verified'].includes(kyc?.government_id.status ?? "pending")
              ? bgPrimarColor
              : colors.text + '60'
          }
        />
      ),
    },
    {
      id: 'proof_address',
      title: 'Proof of Address',
      status: ['inprogress', 'verified'].includes(kyc?.proof_address.status ?? "pending")
        ? true
        : false,
      onpress: () => setKycVerifType('proof_address'),
      statusState: kyc?.proof_address.status,
      description: 'Upload a utility bill or bank statement',
      icon: (
        <FontAwesome5
          name="house-user"
          size={24}
          color={
            ['inprogress', 'verified'].includes(kyc?.proof_address.status ?? "pending")
              ? bgPrimarColor
              : colors.text + '60'
          }
        />
      ),
    },
    {
      id: 'selfie_verification',
      title: 'Selfie Verification',
      status: ['inprogress', 'verified'].includes(kyc?.selfie_verification.status ?? "pending")
        ? true
        : false,
      onpress: () => setKycVerifType('selfie_verification'),
      statusState: kyc?.selfie_verification.status,
      description: 'Take a selfie for identity verification',
      icon: (
        <FontAwesome
          name="user-circle"
          size={24}
          color={
            ['inprogress', 'verified'].includes(kyc?.selfie_verification.status ?? "pending")
              ? bgPrimarColor
              : colors.text + '60'
          }
        />
      ),
    },
  ];

  const getStatusIcon = (status: KYCty) => {
    switch (status) {
      case 'inprogress':
        return <Ionicons name="timer" size={24} color={bgPrimarColor} />;
      case 'verified':
        return (
          <MaterialIcons name="verified" size={24} color={bgPrimarColor} />
        );

      default:
        return <AntDesign name="warning" size={24} color="#ef4444" />;
    }
  };

  const selectedItem = verificationItems.find(
    (item) => item.id === kycVerifyType,
  );

  const handleRefresh = async () => {
    setIsAppLoading(true);
    try {
      const userRes = await postAPI(`/api/auth/user/${user.id}`, undefined, 'GET');
      if (userRes.success) {
        setUser(userRes.data);
      }
    } catch (error) {
      console.log(error);
      
    } finally {
      setIsAppLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader
        onBack={true}
        onBackHandle={() => {
          user.kycScore?.status !=="verified" ? signout() : router.back()
        }}
        centerElement={'Verification Status'}
        rightElement={
          <Pressable className="mr-3" onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color={bgPrimarColor} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="my-4">
          {/* KYC Overview */}
          {user && <KYCard user={user} />}

          {/* Verification Items */}
          <Text
            className="text-md font-semibold my-4"
            style={{ color: colors.text }}
          >
            Verification is required to continue using this app
          </Text>

          {verificationItems?.map((item, index) => (
            <Card key={index} classStyle="p-4 mb-3" elevation={0}>
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={item.status ? () => {} : item.onpress}
                disabled={item.status}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                    {item.icon}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-3">
                      <Text
                        className="text-base font-medium"
                        style={{ color: colors.text }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className={`${item.status ? 'text-green-700' : 'text-red-500'} text-xs capitalize flex-1`}
                      >
                        {item.statusState === "partially"
                          ? 'Required'
                          : item.statusState}
                      </Text>
                    </View>
                    <Text
                      className="text-sm mt-1"
                      style={{ color: colors.text + '80' }}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
                <View className="ml-4">{getStatusIcon(item.statusState ?? "pending")}</View>
              </TouchableOpacity>
            </Card>
          ))}
          {user.kycScore?.status ==="verified" && (
            
            <Button
              title="Book a Ride Now"
              onPress={() => router.push("/(root)/(tabs)")}
              icon={
                <FontAwesome5 name="car" size={18} color="#fff" />
              }
              classStyle="mt-2"
            />
          )}

          {/* Help Section */}
          <Card classStyle="p-4 mt-6 gap-3" elevation={0}>
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
              />
              <Text
                className="text-base font-medium ml-3"
                style={{ color: colors.text }}
              >
                Need Help?
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.text }}>
              Complete all verification steps to unlock full access to the
              platform. If you're having trouble with any step, contact our
              support team for assistance.
            </Text>

            <Button
              title="Support"
              onPress={() => router.push('/support')}
              icon={
                <MaterialIcons name="support-agent" size={18} color="#fff" />
              }
              classStyle="mt-2"
            />
          </Card>
        </View>
      </ScrollView>
      
      <Modal
        visible={!!kycVerifyType}
        animationType="slide"
        // transparent
        onRequestClose={() => setKycVerifType(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white flex-1 mx-4 rounded-2xl p-4  min-h-[40%] max-h-[90%] w-auto">
            <View className="justify-between items-center flex-row">
              <Text className="text-xl font-bold text-center text-primary-900">
                {selectedItem?.title}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setKycVerifType(null)
                  handleRefresh()
                }
                }
                className=""
              >
                <AntDesign name="close" size={22} color={bgPrimarColor} />
              </TouchableOpacity>
            </View>
            {user && (
              <View className="mt-3">
                {kycVerifyType === 'email' && (
                  <PhoneEmailVerification
                    user={user}
                    closeModal={() => setKycVerifType(null)}
                    type="email"
                  />
                )}
                {kycVerifyType === 'phone' && (
                  <PhoneEmailVerification
                    user={user}
                    closeModal={() => setKycVerifType(null)}
                  />
                )}
                {kycVerifyType === 'government_id' && (
                  <GovernmentID user={user} />
                )}
                {kycVerifyType === 'proof_address' && (
                  <ProofOfAddress
                    user={user}
                  />
                )}
                {/* {kycVerifyType === 'selfie_verification' && <SelfieVerification user={user} />} */}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VerificationStatus;
