const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/authMiddleware');
const { chatUpload } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(auth);

// Conversation routes
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.getOrCreateConversation);
router.get('/conversations/unread', chatController.getUnreadCount);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.post('/conversations/:conversationId/messages/image', chatUpload.single('image'), chatController.sendImageMessage);
router.put('/conversations/:conversationId/read', chatController.markAsRead);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

// Legacy routes for backwards compatibility
router.get('/', chatController.getConversations);
router.post('/', chatController.getOrCreateConversation);

module.exports = router;
