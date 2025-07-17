import { FlashList } from '@shopify/flash-list'
import { View, Text } from 'react-native'
import { ChatBubble } from './ChatBubble'
import dayjs from 'dayjs'
import { useChatStore } from '@/store/useChatStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react'

export const ChatList = () => {
  const { messages, chatUser } = useChatStore()
  const { colors } = useThemeStore()

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = dayjs(msg.timestamp).format('YYYY-MM-DD')
    acc[date] = [...(acc[date] || []), msg]
    return acc
  }, {} as Record<string, typeof messages>)

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, msgs]) => ({ 
      date, 
      msgs: msgs.sort((a, b) => a.timestamp - b.timestamp) 
    }))

  const flatData = sections.flatMap(section => [
    { type: 'header', date: section.date, id: `header-${section.date}` },
    ...section.msgs
  ])

  const renderItem = ({ item }: { item: any }) => {
    if ('type' in item && item.type === 'header') {
      return (
        <View className="items-center my-4">
          <View 
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.border }}
          >
            <Text 
              className="text-xs font-medium"
              style={{ color: colors.text + '80' }}
            >
              {dayjs(item.date).format('MMM D, YYYY')}
            </Text>
          </View>
        </View>
      )
    }
    
    return <ChatBubble message={item} />
  }

  if (!chatUser) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text 
          className="text-center text-base"
          style={{ color: colors.text + '60' }}
        >
          Select a user to start chatting
        </Text>
      </View>
    )
  }

  if (messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text 
          className="text-center text-base mb-2"
          style={{ color: colors.text + '60' }}
        >
          No messages yet
        </Text>
        <Text 
          className="text-center text-sm"
          style={{ color: colors.text + '40' }}
        >
          Start a conversation with {chatUser?.user?.firstName}
        </Text>
      </View>
    )
  }

  return (
    <FlashList
      data={flatData}
      renderItem={renderItem}
      keyExtractor={(item) => 'id' in item ? item.id : `header-${item}`}
      estimatedItemSize={60}
      inverted
      contentContainerStyle={{ 
        paddingHorizontal: 16,
        paddingVertical: 8 
      }}
      showsVerticalScrollIndicator={false}
    />
  )
}