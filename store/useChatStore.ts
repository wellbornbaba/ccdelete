import { accountTypeProps, ChatMessageProps, UserBasic } from '@/types'
import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'
import { Ride, UserBasicProps } from '@/types/vehicle';

// interface ChatUserProps {
//   id?: string;
//   firstName: string;
//   lastName: string;
//   email?: string;
//   phoneNumber: string;
//   accountType: accountTypeProps;
// }

type ChatState = {
  chatUser: UserBasic | null
  setChatUser: (user: UserBasic | null) => void
  messages: ChatMessageProps[]
  isTyping: boolean
  setTyping: (val: boolean) => void
  sendMessage: (msg: Omit<ChatMessageProps, 'id' | 'timestamp'>) => void
  receiveMessage: (msg: ChatMessageProps) => void
  clearMessages: () => void
  addMessage: (message: ChatMessageProps) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatUser: null,
  messages: [],
  isTyping: false,

  setChatUser: (user) => {
    set({ chatUser: user, messages: [] }) // Clear messages when switching users
  },

  setTyping: (val) => set({ isTyping: val }),

  sendMessage: (msg) => {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) return

    const fullMessage: ChatMessageProps = {
      ...msg,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sender: 'me'
    }
    
    // Add message to local state immediately
    get().addMessage(fullMessage)
    
    // Simulate sending to server/other user
    // In a real app, this would send via WebSocket or API
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...fullMessage,
        chatUserId: get().chatUser?.id,
        senderId: currentUser.id
      }))
    } else {
      // Simulate receiving a response after a delay
      setTimeout(() => {
        const responseMessage: ChatMessageProps = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text: getAutoResponse(msg.text || ''),
          type: 'text',
          sender: 'them',
          timestamp: Date.now(),
          avatar: get().chatUser?.user?.firstName ? `https://ui-avatars.com/api/?name=${get().chatUser?.user?.firstName}+${get().chatUser?.user?.lastName}&background=076572&color=fff` : undefined
        }
        get().addMessage(responseMessage)
      }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
    }
  },

  receiveMessage: (msg) => {
    get().addMessage(msg)
  },

  addMessage: (message) => {
    set((state) => ({ 
      messages: [message, ...state.messages].sort((a, b) => b.timestamp - a.timestamp)
    }))
  },

  clearMessages: () => set({ messages: [] })
}))

// Auto-response function for demo purposes
const getAutoResponse = (userMessage: string): string => {
  const responses = [
    "Thanks for your message! I'll get back to you soon.",
    "Got it! Let me check on that for you.",
    "I'm currently driving but will respond when I can.",
    "Thanks for the update!",
    "Sounds good, see you soon!",
    "I'm about 5 minutes away.",
    "Perfect, I'll be there shortly.",
    "Thanks for letting me know!",
  ]
  
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! How can I help you today?"
  }
  if (lowerMessage.includes('where') || lowerMessage.includes('location')) {
    return "I'm on my way to the pickup location now."
  }
  if (lowerMessage.includes('time') || lowerMessage.includes('when')) {
    return "I should be there in about 5-10 minutes."
  }
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Happy to help."
  }
  
  return responses[Math.floor(Math.random() * responses.length)]
}

let ws: WebSocket | null = null

export const connectToWS = () => {
  // Only attempt WebSocket connection if available
  if (typeof WebSocket !== 'undefined') {
    try {
      ws = new WebSocket('ws://localhost:8787/ws')
      
      ws.onopen = () => {
        console.log('WebSocket connected')
      }
      
      ws.onmessage = (e) => {
        try {
          const msg: ChatMessageProps = JSON.parse(e.data)
          useChatStore.getState().receiveMessage(msg)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(connectToWS, 3000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
    }
  }
}

export const disconnectWS = () => {
  if (ws) {
    ws.close()
    ws = null
  }
}