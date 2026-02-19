const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');
const cloudinary = require('../config/cloudinary');

const connectedUsers = new Map();

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify JWT token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send-message', async (data, callback) => {
      try {
        const { conversationId, content, receiverId, messageType, imageUrl, imagePublicId } = data;

        // Validate based on message type
        if (messageType === 'image') {
          if (!imageUrl) {
            return callback({ error: 'Image URL is required for image messages' });
          }
        } else {
          if (!content || !content.trim()) {
            return callback({ error: 'Message content is required' });
          }
        }

        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId
        }).populate('participants', 'firstName lastName email avatar role');

        if (!conversation) {
          return callback({ error: 'Conversation not found' });
        }

        // Determine receiver
        const receiver = receiverId || conversation.participants.find(
          p => p._id.toString() !== socket.userId
        )?._id;

        if (!receiver) {
          return callback({ error: 'Receiver not found' });
        }

        // Create message based on type
        const messageData = {
          conversation: conversationId,
          sender: socket.userId,
          receiver: receiver,
          messageType: messageType || 'text'
        };

        if (messageType === 'image') {
          messageData.content = 'Image';
          messageData.imageUrl = imageUrl;
          messageData.imagePublicId = imagePublicId;
        } else {
          // Encrypt text message content
          messageData.content = encrypt(content.trim());
        }

        const message = new Message(messageData);
        await message.save();

        // Update conversation's last message
        conversation.lastMessage = message._id;
        conversation.lastMessageTime = new Date();
        await conversation.save();

        // Populate message details
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'firstName lastName email avatar')
          .populate('receiver', 'firstName lastName email avatar');

        // Prepare message response
        const messageResponse = populatedMessage.toObject();
        if (messageType !== 'image') {
          messageResponse.content = content.trim();
        }

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('new-message', messageResponse);

        // Emit to receiver's personal room for notifications
        const receiverSocketId = connectedUsers.get(receiver.toString());
        if (receiverSocketId) {
          io.to(`user:${receiver.toString()}`).emit('message-notification', {
            conversationId,
            message: messageResponse
          });
        }

        // Update conversation list for both participants
        const conversationResponse = conversation.toObject();
        if (conversationResponse.lastMessage && messageType !== 'image') {
          conversationResponse.lastMessage.content = content.trim();
        }

        conversation.participants.forEach(participant => {
          io.to(`user:${participant._id.toString()}`).emit('conversation-updated', conversationResponse);
        });

        callback({ success: true, message: messageResponse });
      } catch (error) {
        console.error('Error sending message via socket:', error);
        callback({ error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing-start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: socket.userId,
        conversationId
      });
    });

    socket.on('typing-stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle marking messages as read
    socket.on('mark-read', async (data, callback) => {
      try {
        const { conversationId } = data;

        await Message.updateMany(
          { 
            conversation: conversationId, 
            receiver: socket.userId, 
            isRead: false 
          },
          { isRead: true }
        );

        // Notify sender that messages were read
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              io.to(`user:${participantId.toString()}`).emit('messages-read', {
                conversationId,
                readBy: socket.userId
              });
            }
          });
        }

        callback({ success: true });
      } catch (error) {
        console.error('Error marking messages as read:', error);
        callback({ error: 'Failed to mark messages as read' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
}

module.exports = { setupSocket, connectedUsers };
