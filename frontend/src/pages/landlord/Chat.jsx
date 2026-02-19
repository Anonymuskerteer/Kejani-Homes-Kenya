import { useState, useEffect, useRef, useCallback } from 'react'
import ChatListItem from '../../components/ChatListItem'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { 
  getConversations, 
  getMessages, 
  sendMessage as sendMessageAPI,
  sendImageMessage as sendImageMessageAPI,
  createConversation,
  initializeSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendMessageSocket,
  sendImageMessageSocket,
  onNewMessage,
  offNewMessage,
  onConversationUpdated,
  offConversationUpdated,
  onUserTyping,
  offUserTyping,
  onUserStoppedTyping,
  offUserStoppedTyping,
  sendTypingStart,
  sendTypingStop,
  isSocketConnected
} from '../../api/chat'
import { compressImage } from '../../utils/imageCompression'
import { Image, X, Send } from 'lucide-react'

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [typingUser, setTypingUser] = useState(null)
  const [socketReady, setSocketReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const messageInputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      initializeSocket(token)
      setSocketReady(true)
    }

    return () => {
      disconnectSocket()
    }
  }, [])

  // Socket event listeners
  useEffect(() => {
    if (!socketReady) return

    const handleNewMessage = (message) => {
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id)
          if (exists) return prev
          return [...prev, message]
        })
      }
    }

    const handleConversationUpdated = (updatedConversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c._id === updatedConversation._id)
        if (index !== -1) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...updatedConversation }
          updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          return updated
        }
        return [updatedConversation, ...prev]
      })
    }

    const handleUserTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUser(data.userId)
      }
    }

    const handleUserStoppedTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUser(null)
      }
    }

    onNewMessage(handleNewMessage)
    onConversationUpdated(handleConversationUpdated)
    onUserTyping(handleUserTyping)
    onUserStoppedTyping(handleUserStoppedTyping)

    return () => {
      offNewMessage(handleNewMessage)
      offConversationUpdated(handleConversationUpdated)
      offUserTyping(handleUserTyping)
      offUserStoppedTyping(handleUserStoppedTyping)
    }
  }, [socketReady, selectedConversation])

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
      joinConversation(selectedConversation._id)
    }

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation._id)
      }
    }
  }, [selectedConversation?._id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getConversations()
      setConversations(response.conversations || [])
      // Don't auto-select - show chat list first
    } catch (err) {
      setError(err.message || 'Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await getMessages(conversationId)
      setMessages(response.messages || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const handleTyping = useCallback(() => {
    if (!selectedConversation || !isSocketConnected()) return

    sendTypingStart(selectedConversation._id)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(selectedConversation._id)
    }, 3000)
  }, [selectedConversation])

  const handleMessageChange = (e) => {
    setMessageText(e.target.value)
    handleTyping()
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      const compressedFile = await compressImage(file, { maxSizeMB: 1 })
      setSelectedImage(compressedFile)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(compressedFile)
    } catch (err) {
      console.error('Error compressing image:', err)
      alert('Failed to process image')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearImageSelection = () => {
    setImagePreview(null)
    setSelectedImage(null)
  }

  const handleSendImage = async () => {
    if (!selectedImage || !selectedConversation || uploadingImage) return

    setUploadingImage(true)
    sendTypingStop(selectedConversation._id)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    try {
      const receiver = selectedConversation.participants?.find(
        p => p._id !== getCurrentUserId()
      )

      const formData = new FormData()
      formData.append('image', selectedImage)
      if (receiver?._id) {
        formData.append('receiverId', receiver._id)
      }

      const response = await sendImageMessageAPI(selectedConversation._id, formData)
      
      if (response.message) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === response.message._id)
          if (!exists) {
            return [...prev, response.message]
          }
          return prev
        })
      }

      clearImageSelection()
    } catch (err) {
      console.error('Failed to send image:', err)
      alert('Failed to send image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sending) return

    const content = messageText.trim()
    setMessageText('')
    setSending(true)

    sendTypingStop(selectedConversation._id)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    try {
      const receiver = selectedConversation.participants?.find(
        p => p._id !== getCurrentUserId()
      )

      if (isSocketConnected()) {
        try {
          await sendMessageSocket(selectedConversation._id, content, receiver?._id)
        } catch (socketError) {
          console.warn('Socket send failed, falling back to REST:', socketError)
          await sendMessageAPI(selectedConversation._id, { 
            content, 
            receiverId: receiver?._id 
          })
        }
      } else {
        await sendMessageAPI(selectedConversation._id, { 
          content, 
          receiverId: receiver?._id 
        })
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessageText(content)
    } finally {
      setSending(false)
      messageInputRef.current?.focus()
    }
  }

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.id || payload.userId
    } catch {
      return null
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getOtherParticipant = (conversation) => {
    const currentUserId = getCurrentUserId()
    return conversation.participants?.find(p => p._id !== currentUserId)
  }

  const getParticipantName = (participant) => {
    if (!participant) return 'Unknown User'
    const firstName = participant.firstName || ''
    const lastName = participant.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || participant.name || 'Unknown User'
  }

  const getRoleLabel = (role) => {
    if (!role) return ''
    const roleLabels = {
      admin: 'Admin',
      tenant: 'Tenant',
      landlord: 'Landlord',
      agency: 'Agency'
    }
    return roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)
  }

  const renderMessageContent = (message) => {
    if (message.messageType === 'image' || message.imageUrl) {
      return (
        <div className="max-w-full">
          <img 
            src={message.imageUrl} 
            alt="Shared image" 
            className="max-w-full rounded-lg max-h-64 object-cover"
            loading="lazy"
          />
          {message.content && message.content !== 'Image' && (
            <p className="text-sm break-words mt-2">{message.content}</p>
          )}
        </div>
      )
    }
    return <p className="text-sm break-words">{message.content}</p>
  }

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation)
    const name = getParticipantName(otherParticipant)
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return <LoadingState count={3} type="list" />
  }

  if (error) {
    return <ErrorState onRetry={fetchConversations} />
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 -m-4 p-4 pb-28 lg:pb-4">
      {/* Conversations list */}
      <div className={`w-full md:w-80 flex-shrink-0 border border-border dark:border-dark-border rounded-card bg-background dark:bg-dark-background overflow-hidden flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search bar */}
        <div className="p-4 border-b border-border dark:border-dark-border">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-sm"
          />
          <p className="text-xs text-muted dark:text-dark-muted mt-2">
            End-to-end encrypted
          </p>
        </div>

        {filteredConversations.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conversation => {
              const otherParticipant = getOtherParticipant(conversation)
              const participantName = getParticipantName(otherParticipant)
              const roleLabel = getRoleLabel(otherParticipant?.role)
              const lastMessageContent = conversation.lastMessage?.messageType === 'image' 
                ? '📷 Image' 
                : conversation.lastMessage?.content || 'No messages yet'
              return (
                <ChatListItem
                  key={conversation._id}
                  conversation={{
                    id: conversation._id,
                    name: participantName,
                    role: roleLabel,
                    avatar: otherParticipant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation._id}`,
                    lastMessage: lastMessageContent,
                    lastMessageTime: conversation.lastMessageTime || conversation.updatedAt,
                    isRead: conversation.lastMessage?.isRead !== false
                  }}
                  isActive={selectedConversation?._id === conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                />
              )
            })}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No conversations"
              description="Start chatting with tenants about your properties"
              icon="chat"
            />
          </div>
        )}
      </div>

      {/* Chat area */}
      {selectedConversation ? (
        <div className="flex-1 border border-border dark:border-dark-border rounded-card bg-background dark:bg-dark-background flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-border dark:border-dark-border flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden text-muted dark:text-dark-muted"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {(() => {
              const otherParticipant = getOtherParticipant(selectedConversation)
              const participantName = getParticipantName(otherParticipant)
              const roleLabel = getRoleLabel(otherParticipant?.role)
              return (
                <>
                  <img
                    src={otherParticipant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation._id}`}
                    alt={participantName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark dark:text-light">
                      {participantName}
                    </h3>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      {typingUser ? 'Typing...' : roleLabel || 'User'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Encrypted</span>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-foreground dark:bg-dark-foreground">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isMe = message.sender?._id === getCurrentUserId() || message.sender === getCurrentUserId()
                const showDateDivider = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt)

                return (
                  <div key={message._id || index}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-xs text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-card ${
                          isMe
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-background dark:bg-dark-background text-dark dark:text-light rounded-bl-none border border-border dark:border-dark-border'
                        }`}
                      >
                        {renderMessageContent(message)}
                        <p
                          className={`text-xs mt-1 ${
                            isMe ? 'text-white/70' : 'text-muted dark:text-dark-muted'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                          {isMe && (
                            <span className="ml-1">
                              {message.isRead ? '✓✓' : '✓'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted dark:text-dark-muted text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUser && (
            <div className="px-4 py-2 text-xs text-muted dark:text-dark-muted">
              <span className="animate-pulse">Someone is typing...</span>
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="p-4 border-t border-border dark:border-dark-border bg-gray-50 dark:bg-dark-background">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-32 rounded-lg border border-border dark:border-dark-border"
                />
                <button
                  onClick={clearImageSelection}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSendImage}
                  disabled={uploadingImage}
                  className="button-primary px-4 py-2 text-sm flex items-center gap-2"
                >
                  {uploadingImage ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Image
                    </>
                  )}
                </button>
                <button
                  onClick={clearImageSelection}
                  className="px-4 py-2 text-sm border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="p-4 border-t border-border dark:border-dark-border flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploadingImage}
              className="p-2 text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50"
              title="Attach image"
            >
              <Image className="w-5 h-5" />
            </button>
            <input
              ref={messageInputRef}
              type="text"
              value={messageText}
              onChange={handleMessageChange}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              disabled={sending || uploadingImage}
              className="input-field text-sm flex-1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sending || uploadingImage}
              className="button-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center bg-background dark:bg-dark-background">
          <EmptyState
            title="Select a conversation"
            description="Choose a conversation from the list to start messaging"
            icon="chat"
          />
        </div>
      )}
    </div>
  )
}
