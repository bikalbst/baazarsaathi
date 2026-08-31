import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { API_URL, apiRequest } from '../services/api'

const ChatContext = createContext(null)

const entityId = (value) => String(value?._id || value?.id || value || '')

export function ChatProvider({ children }) {
  const { token, user } = useAuth()
  const socketRef = useRef(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messagesByConversation, setMessagesByConversation] = useState({})
  const [typingByConversation, setTypingByConversation] = useState({})
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState('')

  const loadConversations = useCallback(async () => {
    if (!token) return []
    const response = await apiRequest('/api/chat/conversations', { token })
    setConversations(response.data)
    return response.data
  }, [token])

  const loadMessages = useCallback(async (conversationId) => {
    if (!token || !conversationId) return
    const response = await apiRequest(`/api/chat/conversations/${conversationId}/messages`, { token })
    setMessagesByConversation((current) => ({ ...current, [conversationId]: response.data }))
  }, [token])

  useEffect(() => {
    if (!token) {
      setConversations([])
      setSelectedConversation(null)
      setMessagesByConversation({})
      setIsOpen(false)
      return undefined
    }

    let active = true
    const socket = io(API_URL, { auth: { token } })
    socketRef.current = socket

    const joinConversations = (items) => {
      items.forEach((conversation) => socket.emit('join_room', { conversationId: entityId(conversation) }))
    }

    loadConversations()
      .then((items) => { if (active) joinConversations(items) })
      .catch((requestError) => { if (active) setError(requestError.message) })

    socket.on('connect_error', (socketError) => setError(socketError.message || 'Unable to connect to chat'))
    socket.on('receive_message', (message) => {
      const conversationId = entityId(message.conversationId)
      setMessagesByConversation((current) => {
        const existing = current[conversationId] || []
        if (existing.some((item) => entityId(item) === entityId(message))) return current
        return { ...current, [conversationId]: [...existing, message] }
      })
      loadConversations().catch(() => {})
    })
    socket.on('typing', ({ conversationId, user: typingUser }) => {
      setTypingByConversation((current) => ({ ...current, [conversationId]: typingUser }))
    })
    socket.on('stop_typing', ({ conversationId }) => {
      setTypingByConversation((current) => ({ ...current, [conversationId]: null }))
    })
    socket.on('chat_error', (response) => setError(response.message || 'Chat request failed'))

    return () => {
      active = false
      socket.disconnect()
      socketRef.current = null
    }
  }, [loadConversations, token])

  const openConversation = useCallback(async (conversation) => {
    const conversationId = entityId(conversation)
    setSelectedConversation(conversation)
    setIsOpen(true)
    setIsMinimized(false)
    setError('')
    socketRef.current?.emit('join_room', { conversationId })
    try {
      await loadMessages(conversationId)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [loadMessages])

  const startConversation = useCallback(async ({ participantId, listingId }) => {
    if (!token) throw new Error('Please log in to message this seller')
    const response = await apiRequest('/api/chat/conversations', {
      method: 'POST', token, body: { participantId, listingId },
    })
    setConversations((current) => {
      const rest = current.filter((item) => entityId(item) !== entityId(response.data))
      return [response.data, ...rest]
    })
    await openConversation(response.data)
    return response.data
  }, [openConversation, token])

  const sendMessage = useCallback((content) => new Promise((resolve, reject) => {
    const conversationId = entityId(selectedConversation)
    if (!socketRef.current?.connected || !conversationId) {
      reject(new Error('Chat is not connected yet'))
      return
    }
    socketRef.current.emit('send_message', { conversationId, content }, (response) => {
      if (!response?.success) {
        const requestError = new Error(response?.message || 'Unable to send message')
        setError(requestError.message)
        reject(requestError)
        return
      }
      resolve(response.data)
    })
  }), [selectedConversation])

  const emitTyping = useCallback((eventName) => {
    const conversationId = entityId(selectedConversation)
    if (conversationId) socketRef.current?.emit(eventName, { conversationId })
  }, [selectedConversation])

  const openInbox = useCallback(() => {
    setSelectedConversation(null)
    setIsOpen(true)
    setIsMinimized(false)
    setError('')
  }, [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const minimizeChat = useCallback(() => setIsMinimized((current) => !current), [])
  const clearError = useCallback(() => setError(''), [])

  const value = useMemo(() => ({
    conversations,
    selectedConversation,
    messages: messagesByConversation[entityId(selectedConversation)] || [],
    typingUser: typingByConversation[entityId(selectedConversation)] || null,
    isOpen,
    isMinimized,
    error,
    currentUser: user,
    openInbox,
    closeChat,
    minimizeChat,
    openConversation,
    startConversation,
    sendMessage,
    emitTyping,
    clearError,
  }), [clearError, closeChat, conversations, emitTyping, error, isMinimized, isOpen, messagesByConversation, minimizeChat, openConversation, openInbox, selectedConversation, sendMessage, startConversation, typingByConversation, user])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used inside ChatProvider')
  return context
}
