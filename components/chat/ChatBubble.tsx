import { View, Text, Image, TouchableOpacity } from 'react-native'
import { ChatMessageProps } from '@/types'
import dayjs from 'dayjs'
import { useThemeStore } from '@/store/useThemeStore'
import { bgPrimarColor } from '@/utils/colors'

type Props = {
  message: ChatMessageProps
}

export const ChatBubble = ({ message }: Props) => {
  const isMe = message.sender === 'me'
  const { colors } = useThemeStore()

  const formatTime = (timestamp: number) => {
    return dayjs(timestamp).format('h:mm A')
  }

  return (
    <View className={`my-1 max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
      {/* Message bubble */}
      <View 
        className={`px-4 py-2 rounded-2xl ${
          isMe ? 'rounded-br-md' : 'rounded-bl-md'
        }`}
        style={{
          backgroundColor: isMe ? bgPrimarColor : colors.card,
          borderWidth: isMe ? 0 : 1,
          borderColor: colors.border
        }}
      >
        {message.type === 'text' && (
          <Text 
            className="text-base leading-5"
            style={{ color: isMe ? 'white' : colors.text }}
          >
            {message.text}
          </Text>
        )}
        
        {message.type === 'image' && message.uri && (
          <TouchableOpacity>
            <Image 
              source={{ uri: message.uri }} 
              className="w-48 h-48 rounded-xl" 
              resizeMode="cover"
            />
            {message.text && message.text !== 'Image' && (
              <Text 
                className="text-sm mt-2"
                style={{ color: isMe ? 'white' : colors.text }}
              >
                {message.text}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {/* Timestamp */}
      <Text 
        className={`text-xs mt-1 ${isMe ? 'text-right' : 'text-left'}`}
        style={{ color: colors.text + '60' }}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  )
}