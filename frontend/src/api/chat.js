import axiosInstance from './axios'
import { io } from 'socket.io-client'

// Socket.io connection
let socket = null
let socketConnected = false

// Initialize socket connection
export const initializeSocket = (token) => {
  if (socket && socketConnected) {
    return socket
  }

  // Socket.io needs to connect to base URL without /api path
  // VITE_API_URL might be http://localhost:5000/api, so we strip the /api part
  const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:5000/api/'||'https://wjqxfkd4-5173.inc1.devtunnels.ms/api/'
  const SOCKET_URL = apiUrl.replace(/\/api$/, '')
  
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  socket.on('connect', () => {
    console.log('Socket connected')
    socketConnected = true
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
    socketConnected = false
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message)
    socketConnected = false
  })

  return socket
}

// Get socket instance
export const getSocket = () => socket

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    socketConnected = false
  }
}

// Check if socket is connected
export const isSocketConnected = () => socketConnected

// Join a conversation room
export const joinConversation = (conversationId) => {
  if (socket && socketConnected) {
    socket.emit('join-conversation', conversationId)
  }
}

// Leave a conversation room
export const leaveConversation = (conversationId) => {
  if (socket && socketConnected) {
    socket.emit('leave-conversation', conversationId)
  }
}

// Send message via socket
export const sendMessageSocket = (conversationId, content, receiverId) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socketConnected) {
      reject(new Error('Socket not connected'))
      return
    }

    socket.emit('send-message', { conversationId, content, receiverId }, (response) => {
      if (response.error) {
        reject(new Error(response.error))
      } else {
        resolve(response.message)
      }
    })
  })
}

// Send image message via socket
export const sendImageMessageSocket = (conversationId, imageUrl, imagePublicId, receiverId) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socketConnected) {
      reject(new Error('Socket not connected'))
      return
    }

    socket.emit('send-message', { 
      conversationId, 
      content: 'Image', 
      receiverId,
      messageType: 'image',
      imageUrl,
      imagePublicId
    }, (response) => {
      if (response.error) {
        reject(new Error(response.error))
      } else {
        resolve(response.message)
      }
    })
  })
}

// Send typing indicator
export const sendTypingStart = (conversationId) => {
  if (socket && socketConnected) {
    socket.emit('typing-start', { conversationId })
  }
}

export const sendTypingStop = (conversationId) => {
  if (socket && socketConnected) {
    socket.emit('typing-stop', { conversationId })
  }
}

// Mark messages as read via socket
export const markMessagesReadSocket = (conversationId) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socketConnected) {
      reject(new Error('Socket not connected'))
      return
    }

    socket.emit('mark-read', { conversationId }, (response) => {
      if (response.error) {
        reject(new Error(response.error))
      } else {
        resolve(response)
      }
    })
  })
}

// Listen for new messages
export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new-message', callback)
  }
}

// Remove new message listener
export const offNewMessage = (callback) => {
  if (socket) {
    socket.off('new-message', callback)
  }
}

// Listen for message notifications
export const onMessageNotification = (callback) => {
  if (socket) {
    socket.on('message-notification', callback)
  }
}

// Remove message notification listener
export const offMessageNotification = (callback) => {
  if (socket) {
    socket.off('message-notification', callback)
  }
}

// Listen for conversation updates
export const onConversationUpdated = (callback) => {
  if (socket) {
    socket.on('conversation-updated', callback)
  }
}

// Remove conversation update listener
export const offConversationUpdated = (callback) => {
  if (socket) {
    socket.off('conversation-updated', callback)
  }
}

// Listen for typing indicators
export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user-typing', callback)
  }
}

export const offUserTyping = (callback) => {
  if (socket) {
    socket.off('user-typing', callback)
  }
}

export const onUserStoppedTyping = (callback) => {
  if (socket) {
    socket.on('user-stopped-typing', callback)
  }
}

export const offUserStoppedTyping = (callback) => {
  if (socket) {
    socket.off('user-stopped-typing', callback)
  }
}

// Listen for messages read
export const onMessagesRead = (callback) => {
  if (socket) {
    socket.on('messages-read', callback)
  }
}

export const offMessagesRead = (callback) => {
  if (socket) {
    socket.off('messages-read', callback)
  }
}

// REST API functions

export const getConversations = async () => {
  try {
    const response = await axiosInstance.get('/chat/conversations')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch conversations' }
  }
}

export const getChats = getConversations // Alias for backwards compatibility

export const getConversationById = async (id) => {
  try {
    const response = await axiosInstance.get(`/chat/conversations/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch conversation' }
  }
}

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch messages' }
  }
}

export const sendMessage = async (conversationId, data) => {
  try {
    const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send message' }
  }
}

// Send image message via REST API
export const sendImageMessage = async (conversationId, formData) => {
  try {
    const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send image message' }
  }
}

export const createConversation = async (data) => {
  try {
    const response = await axiosInstance.post('/chat/conversations', data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create conversation' }
  }
}

export const markAsRead = async (conversationId) => {
  try {
    const response = await axiosInstance.put(`/chat/conversations/${conversationId}/read`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark as read' }
  }
}

export const deleteConversation = async (conversationId) => {
  try {
    const response = await axiosInstance.delete(`/chat/conversations/${conversationId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete conversation' }
  }
}

export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/chat/conversations/unread')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch unread count' }
  }
}
