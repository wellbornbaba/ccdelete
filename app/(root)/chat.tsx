import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { connectToWS, useChatStore, disconnectWS } from '@/store/useChatStore';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/useThemeStore';
import { Avatar } from '@/components/ui/Avatar';
import AvatarWithStatus from '@/components/ui/AvatarWithStatus';
import BgLoading from '@/components/BgLoading';
import { AntDesign } from '@expo/vector-icons';
import { KeyBoardViewArea } from '@/components/ui/KeyBoardViewArea';
import { BASEURL } from '@/utils/fetch';

export default function AppPrivateChat() {
  const { isTyping, chatUser, setChatUser } = useChatStore();
  const { colors } = useThemeStore();

  // useEffect(() => {
  //   // Connect to WebSocket when component mounts
  //   connectToWS();

  //   // Cleanup on unmount
  //   return () => {
  //     disconnectWS();
  //   };
  // }, []);

  const handleBack = () => {
    router.back();
    setChatUser(null);
  };

  if (!chatUser) return <BgLoading popup={true} title="Loading..." />;
  const fullname = `${chatUser?.firstName} ${chatUser?.lastName}`;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="px-4 border-b border-b-gray-200">
        <View className="flex-row justify-between items-center my-2">
          <View className="flex-row items-center gap-3 ">
            <View>
              <Pressable onPress={() => router.back()} className="p-2 ">
                <AntDesign name="arrowleft" size={22} color={'#076572'} />
              </Pressable>
            </View>

            <View className="flex-row items-start gap-2">
              <Avatar
                name={fullname}
                size={32}
                source={`${chatUser?.photoURL}`}
              />
              <View className="">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  {fullname}
                </Text>
                <Text
                  className="text-sm capitalize"
                  style={{ color: colors.text + '60' }}
                >
                  {chatUser?.accountType}
                </Text>
              </View>
            </View>
          </View>
          <View></View>
        </View>
      </View>

      {/* Chat Content */}
      <View className="flex-1">
        <ChatList />

        {/* Typing indicator */}
        {isTyping && (
          <View className="px-4 py-2">
            <Text
              className="text-xs italic"
              style={{ color: colors.text + '60' }}
            >
              {chatUser?.firstName} is typing...
            </Text>
          </View>
        )}

        <ChatInput />
      </View>
    </SafeAreaView>
  );
}
