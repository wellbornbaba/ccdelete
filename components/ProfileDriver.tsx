import { View, Text } from 'react-native';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { Redirect } from 'expo-router';
import { maskString, Wordstruncate } from '@/utils';
import CardProfilePill from './ui/CardProfilePill';
import AvatarWithStatus from './ui/AvatarWithStatus';
import { bgPrimarColor } from '@/utils/colors';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import DriverCarCard from './ui/DriverCarCard';
import KYCard from './ui/KYCard';
import { BASEURL } from '@/utils/fetch';

export default function ProfileDriver() {
  const colors = useThemeStore((state) => state.colors);
  const currentUser = useAuthStore((state) => state.user);
  const userProfileData = useProfileStore((state) => state.userProfileData);

  const user = userProfileData ? userProfileData : currentUser;
  const driver = userProfileData ? userProfileData.driver : currentUser?.driver;
  const star = userProfileData
    ? userProfileData.driverStatistic
    : currentUser?.driverStatistic;
  if (!user) return <Redirect href={'/(root)/(tabs)'} />;

  const KYCStatus = user.kycScore?.status || 'unverified';

  const fullAdddress = `${user?.street}, ${user?.city}, ${user?.state}`;

  return (
    <View className="flex my-4 gap-4 ">
      <View className="justify-between items-start flex-row">
        <View className="flex-row gap-1">
          <AvatarWithStatus
            photoURL={`${user.photoURL}`}
            fullname={`${user.firstName} ${user.lastName}`}
            size={82}
            status={KYCStatus}
            statusStyle={{ right: -40, bottom: -3 }}
          />

          <View className="ml-2 flex-1">
            <View className="">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold mr-1 capitalize ">
                  {Wordstruncate(`${user.firstName} ${user.lastName}`, 22)}
                </Text>
                <Ionicons name="car-outline" size={15} color={bgPrimarColor} />
              </View>
              <Text className="text-xs text-gray-500">
                {driver?.model} • {driver?.interior_color} •{' '}
                {driver?.plate_number}
              </Text>
            </View>

            <View className=" ">
              <View className="flex-row gap-2">
                <Text
                  style={{ color: bgPrimarColor }}
                  className="text-xs uppercase self-end"
                >
                  {user.accountType}
                </Text>
                <View className="flex-row">
                  {star &&
                    star.starDistribution &&
                    star.starDistribution.map((item, _index) => (
                      <Feather
                        key={_index}
                        name="star"
                        size={14}
                        color={item.star <= item.count ? '#FFD700' : '#E0E0E0'}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                </View>
              </View>
              <View className="flex-row items-center gap-1 justify-center self-end my-1 mr-2">
                <Ionicons name="car" size={18} color={bgPrimarColor} />
                <Text
                  style={{
                    color: colors.text,
                  }}
                  className="text-xs font-['Inter-SemiBold'] "
                >
                  {user.totalRides || 0} trips completed
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {user && <KYCard user={user} />}

      <View>
        <View className="flex-row gap-4 justify-between">
          <View className="p-3 items-center bg-bgColor rounded-xl flex-1">
            <Text className="text-3xl text-primary-900 font-['Inter-Bold']">
              {star?.acceptanceRate || 0}%
            </Text>
            <Text className="text-sm text-gray-600">Acceptance</Text>
          </View>
          <View className="p-3 items-center bg-bgColor rounded-xl flex-1">
            <Text className="text-3xl text-primary-900 font-['Inter-Bold']">
              {star?.completionRate || 0}%
            </Text>
            <Text className="text-sm text-gray-600">Completion</Text>
          </View>
          <View className="p-3 items-center bg-bgColor rounded-xl flex-1">
            <Text className="text-3xl text-primary-900 font-['Inter-Bold']">
              {star?.avgRating || 0}
            </Text>
            <Text className="text-sm text-gray-600">Rating</Text>
          </View>
        </View>
      </View>

      <View className=" bg-bgColor rounded-2xl p-5">
        <Text
          style={{
            color: colors.text,
          }}
          className="text-lg font-['Inter-Bold'] mb-2 "
        >
          Vehicle Information
        </Text>
        <View className="mt-2 gap-1">
          <CardProfilePill
            title={'Model'}
            subtitle={user.driver?.model || ''}
            icon={<Ionicons name="car" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Plate Number'}
            subtitle={user.driver?.plate_number || 'Unknow'}
            icon={
              <Ionicons name="file-tray-full" size={18} color={bgPrimarColor} />
            }
          />
          <CardProfilePill
            title={'Exterior Color'}
            subtitle={user.driver?.exterior_color || 'Nill'}
            icon={
              <Ionicons
                name="color-palette-outline"
                size={18}
                color={bgPrimarColor}
              />
            }
          />
          <CardProfilePill
            title={'Interior Color'}
            subtitle={user.driver?.interior_color || 'Nil'}
            icon={
              <Ionicons name="color-palette" size={18} color={bgPrimarColor} />
            }
          />
          <CardProfilePill
            title={'Seats'}
            subtitle={`${user.driver?.seats}` || '4'}
            icon={
              <MaterialCommunityIcons
                name="seatbelt"
                size={18}
                color={bgPrimarColor}
              />
            }
          />
          <CardProfilePill
            title={'Chassis Number'}
            subtitle={
              user.driver?.chasis
                ? maskString(user.driver?.chasis, 2, 5)
                : 'Nil'
            }
            icon={
              <MaterialCommunityIcons
                name="engine-outline"
                size={18}
                color={bgPrimarColor}
              />
            }
          />

          <View className="flex-row w-full flex-1 justify-center items-center">
            <DriverCarCard
              title="Front Rear"
              pic={
                driver?.front_car_url
                  ? `${BASEURL}${driver?.front_car_url}`
                  : ''
              }
              type="front"
            />
            <DriverCarCard
              title="Back Rear"
              pic={
                driver?.back_car_url ? `${BASEURL}${driver?.back_car_url}` : ''
              }
              type="back"
            />
          </View>
        </View>
      </View>

      <View className=" bg-bgColor rounded-2xl p-5">
        <Text
          style={{
            color: colors.text,
          }}
          className="text-lg font-['Inter-Bold'] mb-2 "
        >
          Personal Details
        </Text>
        <View className="mt-2 gap-1">
          <CardProfilePill
            title={'Phone'}
            subtitle={maskString(String(user?.phoneNumber), 3, 7)}
            icon={<Feather name="phone" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Gender'}
            subtitle={user.gender || 'Unknow'}
            icon={<Feather name="user" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Email'}
            subtitle={user.email ? maskString(user.email, 4, 14) : 'Nill'}
            icon={<Feather name="mail" size={18} color={bgPrimarColor} />}
          />
          <CardProfilePill
            title={'Home Address'}
            subtitle={user?.street ? maskString(fullAdddress, 1, 5) : 'Nil'}
            icon={<Feather name="map-pin" size={18} color={bgPrimarColor} />}
          />
        </View>
      </View>

      <View className=" bg-bgColor rounded-2xl p-5 ">
        <Text
          style={{
            color: colors.text,
          }}
          className="text-lg font-['Inter-Bold'] mb-2 "
        >
          KYC Documents
        </Text>
        <View className="mt-2 gap-1">
          <CardProfilePill
            subtitle={'Government Document'}
            icon={
              <Ionicons name="document-text" size={18} color={bgPrimarColor} />
            }
            righticon={
              <View className="flex-row rounded-full items-center justify-between bg-gray-50 p-1">
                {user.kycScore?.kyc?.government_id.isVerified ? (
                  <View className="gap-2 flex-row">
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={bgPrimarColor}
                    />
                    <Text className="text-xs text-bgDefault">Verified</Text>
                  </View>
                ) : (
                  <View className="gap-2 flex-row">
                    <AntDesign name="warning" size={13} color={'red'} />
                    <Text className="text-xs text-red-800">Unverify</Text>
                  </View>
                )}
              </View>
            }
          />

          <CardProfilePill
            subtitle={'Driver License'}
            icon={
              <Ionicons name="document-text" size={18} color={bgPrimarColor} />
            }
            righticon={
              <View className="flex-row rounded-full items-center justify-between bg-gray-50 p-1">
                {user.driver?.dstatus ==="approved" ? (
                  <View className="gap-2 flex-row">
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={bgPrimarColor}
                    />
                    <Text className="text-xs text-bgDefault">Verified</Text>
                  </View>
                ) : (
                  <View className="gap-2 flex-row">
                    <AntDesign name="warning" size={13} color={'red'} />
                    <Text className="text-xs text-red-800">Unverify</Text>
                  </View>
                )}
              </View>
            }
          />

          <CardProfilePill
            subtitle={'Vehicle Registration'}
            icon={
              <Ionicons name="document-text" size={18} color={bgPrimarColor} />
            }
            righticon={
              <View className="flex-row rounded-full items-center justify-between bg-gray-50 p-1">
                {user.kycScore?.kyc?.selfie_verification.isVerified ? (
                  <View className="gap-2 flex-row">
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={bgPrimarColor}
                    />
                    <Text className="text-xs text-bgDefault">Verified</Text>
                  </View>
                ) : (
                  <View className="gap-2 flex-row">
                    <AntDesign name="warning" size={13} color={'red'} />
                    <Text className="text-xs text-red-800">Unverify</Text>
                  </View>
                )}
              </View>
            }
          />

          <CardProfilePill
            subtitle={'Proof Of Address'}
            icon={
              <Ionicons name="document-text" size={18} color={bgPrimarColor} />
            }
            righticon={
              <View className="flex-row rounded-full items-center justify-between bg-gray-50 p-1">
                {user.kycScore?.kyc?.proof_address.isVerified ? (
                  <View className="gap-2 flex-row">
                    <MaterialIcons
                      name="verified"
                      size={13}
                      color={bgPrimarColor}
                    />
                    <Text className="text-xs text-bgDefault">Verified</Text>
                  </View>
                ) : (
                  <View className="gap-2 flex-row">
                    <AntDesign name="warning" size={13} color={'red'} />
                    <Text className="text-xs text-red-800">Unverify</Text>
                  </View>
                )}
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
}
