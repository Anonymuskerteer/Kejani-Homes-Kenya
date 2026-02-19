const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: 5000
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  imageUrl: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 });

messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Message', messageSchema);
