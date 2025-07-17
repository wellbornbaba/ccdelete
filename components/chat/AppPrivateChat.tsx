import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { connectToWS, useChatStore } from '@/store/useChatStore';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/useThemeStore';
import { User } from '@/types';


export default function AppPrivateChat({frienduser}: {frienduser: User}) {
  const isTyping = useChatStore((s) => s.isTyping);
  const { colors } = useThemeStore();

  useEffect(() => {
    connectToWS();
  }, []);

  console.log(frienduser);
  

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="px-4">
        <DashboardPagesHeader
          onBack={true}
          onBackHandle={() => {
            // setRideDetail(null);
            // setSelectedRide(null);
            router.back();
          }}
          centerElement={'Chat'}
        />
      </View>
      <View className="flex-1 ">
        <ChatList />
        {isTyping && (
          <Text className="text-xs text-gray-500 text-center mb-1">
            User is typing...
          </Text>
        )}
        <ChatInput />
      </View>
    </SafeAreaView>
  );
}

// import React, { useState, useCallback, useEffect } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { GiftedChat, IMessage } from 'react-native-gifted-chat';
// import { useThemeStore } from '@/store/useThemeStore';
// import { useAuthStore } from '@/store/useAuthStore';

// export default function ChatScreen() {
//   const { colors } = useThemeStore();
//   const { user } = useAuthStore();

//   // Mock: Assume user with id 1 is passenger, id 2 is driver
//   const [messages, setMessages] = useState<IMessage[]>([]);

//   useEffect(() => {
//     setMessages([
//       {
//         _id: 1,
//         text: 'Hello! Your driver is on the way.',
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'Driver',
//           avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
//         },
//       },
//       {
//         _id: 2,
//         text: 'Thank you!',
//         createdAt: new Date(),
//         user: {
//           _id: 1,
//           name: 'Passenger',
//           avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
//         },
//       },
//     ]);
//   }, []);

//   const onSend = useCallback((newMessages: IMessage[] = []) => {
//     setMessages(previousMessages =>
//       GiftedChat.append(previousMessages, newMessages)
//     );
//   }, []);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{
//           _id: user?.id || 1,
//           name: user?.firstName || 'User',
//           avatar: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
//         }}
//         renderAvatar={null}
//         showAvatarForEveryMessage={false}
//         showUserAvatar={false}
//         alwaysShowSend={true}
//         timeTextStyle={{
//           right: { color: colors.text + '80' },
//           left: { color: colors.text + '80' },
//         }}
//         renderUsernameOnMessage
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });
