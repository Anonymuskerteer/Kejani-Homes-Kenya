const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');
const cloudinary = require('../config/cloudinary');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'firstName lastName email avatar role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Decrypt last message content for each conversation
    const conversationsWithDecryptedMessages = conversations.map(conv => {
      const convObj = conv.toObject();
      if (convObj.lastMessage && convObj.lastMessage.content) {
        convObj.lastMessage.content = decrypt(convObj.lastMessage.content);
      }
      return convObj;
    });

    res.json({ conversations: conversationsWithDecryptedMessages });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// Get or create a conversation between two users
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { recipientId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    }).populate('participants', 'firstName lastName email avatar role');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName email avatar role');
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName email avatar')
      .populate('receiver', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Decrypt message contents and format for response
    const decryptedMessages = messages.reverse().map(msg => {
      const msgObj = msg.toObject();
      if (msgObj.content) {
        msgObj.content = decrypt(msgObj.content);
      }
      return msgObj;
    });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        receiver: userId, 
        isRead: false 
      },
      { isRead: true }
    );

    res.json({ messages: decryptedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// Send a text message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { conversationId } = req.params;
    const { content, receiverId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate('participants', 'firstName lastName email avatar role');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Determine receiver
    const receiver = receiverId || conversation.participants.find(
      p => p._id.toString() !== userId
    )?._id;

    if (!receiver) {
      return res.status(400).json({ message: 'Receiver not found' });
    }

    // Encrypt message content before saving
    const encryptedContent = encrypt(content.trim());

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      receiver: receiver,
      content: encryptedContent,
      messageType: 'text'
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate message details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email avatar')
      .populate('receiver', 'firstName lastName email avatar');

    // Return decrypted message to sender
    const messageResponse = populatedMessage.toObject();
    messageResponse.content = content.trim();

    res.status(201).json({ message: messageResponse });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// Send an image message
exports.sendImageMessage = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { conversationId } = req.params;
    const { receiverId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate('participants', 'firstName lastName email avatar role');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Determine receiver
    const receiver = receiverId || conversation.participants.find(
      p => p._id.toString() !== userId
    )?._id;

    if (!receiver) {
      return res.status(400).json({ message: 'Receiver not found' });
    }

    // Create message with image
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      receiver: receiver,
      content: 'Image', // Placeholder content for image messages
      messageType: 'image',
      imageUrl: req.file.path,
      imagePublicId: req.file.filename
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate message details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email avatar')
      .populate('receiver', 'firstName lastName email avatar');

    const messageResponse = populatedMessage.toObject();

    res.status(201).json({ message: messageResponse });
  } catch (error) {
    console.error('Error sending image message:', error);
    res.status(500).json({ message: 'Server error sending image message' });
  }
};

// Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Message.updateMany(
      { 
        conversation: conversationId, 
        receiver: userId, 
        isRead: false 
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Server error marking messages as read' });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get all image messages to delete from Cloudinary
    const imageMessages = await Message.find({ 
      conversation: conversationId, 
      messageType: 'image',
      imagePublicId: { $exists: true }
    });

    // Delete images from Cloudinary
    for (const msg of imageMessages) {
      if (msg.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(msg.imagePublicId);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error deleting conversation' });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error fetching unread count' });
  }
};
