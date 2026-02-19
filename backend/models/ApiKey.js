const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  key: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'kj_' + crypto.randomBytes(32).toString('hex');
    }
  },
  secret: {
    type: String,
    required: true,
    default: function() {
      return crypto.randomBytes(64).toString('hex');
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin']
  }],
  rateLimit: {
    type: Number,
    default: 1000,
    min: [1, 'Rate limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ createdBy: 1 });
apiKeySchema.index({ isActive: 1 });

// Method to validate API key
apiKeySchema.methods.validateKey = function(providedKey) {
  return this.key === providedKey && this.isActive;
};

// Method to increment usage
apiKeySchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Method to check if key is expired
apiKeySchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Method to hide sensitive data in JSON output
apiKeySchema.methods.toJSON = function() {
  const obj = this.toObject();
  // Only show last 8 characters of secret for security
  if (obj.secret && obj.secret.length > 8) {
    obj.secret = '***' + obj.secret.slice(-8);
  }
  return obj;
};

// Static method to generate new key
apiKeySchema.statics.generateKey = function() {
  return 'kj_' + crypto.randomBytes(32).toString('hex');
};

// Static method to generate new secret
apiKeySchema.statics.generateSecret = function() {
  return crypto.randomBytes(64).toString('hex');
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;