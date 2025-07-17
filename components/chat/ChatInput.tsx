import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useChatStore } from '@/store/useChatStore';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { textGrayColor, bgPrimarColor } from '@/utils/colors';
import { useThemeStore } from '@/store/useThemeStore';
import { KeyBoardViewArea } from '../ui/KeyBoardViewArea';

export const ChatInput = () => {
  const [text, setText] = useState('');
  const { sendMessage, chatUser } = useChatStore();
  const { colors } = useThemeStore();

  const handleSend = () => {
    if (text.trim() && chatUser) {
      sendMessage({ text: text.trim(), type: 'text', sender: 'me' });
      setText('');
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow access to your photo library to send images.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri && chatUser) {
        sendMessage({
          type: 'image',
          uri: result.assets[0].uri,
          text: 'Image',
          sender: 'me',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (!chatUser) {
    return (
      <View className="p-4 items-center">
        <Text style={{ color: colors.text + '80' }} className="text-sm">
          No chat user selected
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center p-3 border-t"
      style={{
        borderTopColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <TouchableOpacity onPress={pickImage} className="px-2">
        <MaterialIcons name="attach-file" size={24} color={textGrayColor} />
      </TouchableOpacity>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Message ${chatUser?.firstName}...`}
          placeholderTextColor={colors.text + '60'}
          className="flex-1 p-3 mx-2 rounded-lg min-h-[44px] max-h-[100px]"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          multiline
          textAlignVertical="center"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
        />
      </KeyboardAvoidingView>

      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim()}
        className="px-4 py-3 rounded-lg items-center justify-center min-w-[50px]"
        style={{
          backgroundColor: text.trim() ? bgPrimarColor : colors.border,
          opacity: text.trim() ? 1 : 0.5,
        }}
      >
        <Feather
          name="send"
          size={20}
          color={text.trim() ? 'white' : colors.text + '60'}
        />
      </TouchableOpacity>
    </View>
  );
};
