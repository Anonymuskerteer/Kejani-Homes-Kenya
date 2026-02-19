const mongoose = require('mongoose');

const apiIntegrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Integration name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Integration type is required'],
    enum: ['payment', 'sms', 'email', 'storage', 'analytics', 'maps', 'auth', 'other']
  },
  provider: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  credentials: {
    apiKey: {
      type: String,
      required: true
    },
    apiSecret: {
      type: String
    },
    webhookSecret: {
      type: String
    },
    additionalFields: {
      type: Map,
      of: String
    }
  },
  settings: {
    sandbox: {
      type: Boolean,
      default: false
    },
    autoRetry: {
      type: Boolean,
      default: true
    },
    timeout: {
      type: Number,
      default: 30000
    },
    customSettings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  webhookUrl: {
    type: String,
    trim: true
  },
  webhookEvents: [{
    event: String,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  usageStats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    successfulRequests: {
      type: Number,
      default: 0
    },
    failedRequests: {
      type: Number,
      default: 0
    },
    lastRequest: {
      type: Date
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isInstalled: {
    type: Boolean,
    default: true
  },
  installedAt: {
    type: Date,
    default: Date.now
  },
  lastSyncAt: {
    type: Date
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
apiIntegrationSchema.index({ type: 1 });
apiIntegrationSchema.index({ provider: 1 });
apiIntegrationSchema.index({ isActive: 1 });
apiIntegrationSchema.index({ createdBy: 1 });

// Method to update usage stats
apiIntegrationSchema.methods.updateUsageStats = async function(success, responseTime) {
  this.usageStats.totalRequests += 1;
  this.usageStats.lastRequest = new Date();
  
  if (success) {
    this.usageStats.successfulRequests += 1;
  } else {
    this.usageStats.failedRequests += 1;
  }
  
  // Calculate rolling average response time
  if (responseTime) {
    const totalSuccessful = this.usageStats.successfulRequests;
    const currentAvg = this.usageStats.averageResponseTime || 0;
    this.usageStats.averageResponseTime = 
      ((currentAvg * (totalSuccessful - 1)) + responseTime) / totalSuccessful;
  }
  
  return this.save();
};

// Method to hide sensitive credentials in JSON output
apiIntegrationSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Hide sensitive credential data
  if (obj.credentials) {
    if (obj.credentials.apiKey && obj.credentials.apiKey.length > 8) {
      obj.credentials.apiKey = '***' + obj.credentials.apiKey.slice(-8);
    }
    if (obj.credentials.apiSecret) {
      obj.credentials.apiSecret = '***hidden***';
    }
    if (obj.credentials.webhookSecret) {
      obj.credentials.webhookSecret = '***hidden***';
    }
  }
  
  return obj;
};

// Static method to get integration templates
apiIntegrationSchema.statics.getTemplates = function() {
  return [
    {
      name: 'M-Pesa',
      type: 'payment',
      provider: 'mpesa',
      description: 'Safaricom M-Pesa payment gateway integration',
      icon: 'mpesa',
      credentials: {
        apiKey: { label: 'Consumer Key', required: true },
        apiSecret: { label: 'Consumer Secret', required: true },
        additionalFields: {
          shortcode: { label: 'Business Shortcode', required: true },
          passkey: { label: 'Passkey', required: true },
          tillNumber: { label: 'Till Number', required: false }
        }
      },
      settings: {
        sandbox: { label: 'Use Sandbox Environment', default: true }
      }
    },
    {
      name: 'Flutterwave',
      type: 'payment',
      provider: 'flutterwave',
      description: 'Flutterwave payment gateway for African businesses',
      icon: 'flutterwave',
      credentials: {
        apiKey: { label: 'Public Key', required: true },
        apiSecret: { label: 'Secret Key', required: true },
        additionalFields: {
          encryptionKey: { label: 'Encryption Key', required: true }
        }
      }
    },
    {
      name: 'Paystack',
      type: 'payment',
      provider: 'paystack',
      description: 'Paystack payment gateway for African businesses',
      icon: 'paystack',
      credentials: {
        apiKey: { label: 'Public Key', required: true },
        apiSecret: { label: 'Secret Key', required: true },
        webhookSecret: { label: 'Webhook Secret', required: false }
      }
    },
    {
      name: "Africa's Talking",
      type: 'sms',
      provider: 'africastalking',
      description: 'SMS and USSD gateway for Africa',
      icon: 'africastalking',
      credentials: {
        apiKey: { label: 'API Key', required: true },
        additionalFields: {
          username: { label: 'Username', required: true },
          senderId: { label: 'Sender ID', required: false }
        }
      },
      settings: {
        sandbox: { label: 'Use Sandbox Environment', default: true }
      }
    },
    {
      name: 'Twilio',
      type: 'sms',
      provider: 'twilio',
      description: 'SMS and voice communication platform',
      icon: 'twilio',
      credentials: {
        apiKey: { label: 'Account SID', required: true },
        apiSecret: { label: 'Auth Token', required: true },
        additionalFields: {
          phoneNumber: { label: 'Twilio Phone Number', required: true }
        }
      }
    },
    {
      name: 'SendGrid',
      type: 'email',
      provider: 'sendgrid',
      description: 'Email delivery and marketing platform',
      icon: 'sendgrid',
      credentials: {
        apiKey: { label: 'API Key', required: true }
      }
    },
    {
      name: 'Mailgun',
      type: 'email',
      provider: 'mailgun',
      description: 'Email delivery service',
      icon: 'mailgun',
      credentials: {
        apiKey: { label: 'API Key', required: true },
        additionalFields: {
          domain: { label: 'Domain', required: true }
        }
      }
    },
    {
      name: 'Cloudinary',
      type: 'storage',
      provider: 'cloudinary',
      description: 'Cloud-based image and video management',
      icon: 'cloudinary',
      credentials: {
        apiKey: { label: 'API Key', required: true },
        apiSecret: { label: 'API Secret', required: true },
        additionalFields: {
          cloudName: { label: 'Cloud Name', required: true }
        }
      }
    },
    {
      name: 'AWS S3',
      type: 'storage',
      provider: 'aws-s3',
      description: 'Amazon Simple Storage Service',
      icon: 'aws',
      credentials: {
        apiKey: { label: 'Access Key ID', required: true },
        apiSecret: { label: 'Secret Access Key', required: true },
        additionalFields: {
          region: { label: 'Region', required: true },
          bucket: { label: 'Bucket Name', required: true }
        }
      }
    },
    {
      name: 'Google Analytics',
      type: 'analytics',
      provider: 'google-analytics',
      description: 'Web analytics service',
      icon: 'google',
      credentials: {
        apiKey: { label: 'Tracking ID', required: true },
        additionalFields: {
          measurementId: { label: 'Measurement ID (GA4)', required: false }
        }
      }
    },
    {
      name: 'Google Maps',
      type: 'maps',
      provider: 'google-maps',
      description: 'Maps and geolocation services',
      icon: 'google',
      credentials: {
        apiKey: { label: 'API Key', required: true }
      }
    },
    {
      name: 'Firebase Auth',
      type: 'auth',
      provider: 'firebase',
      description: 'Firebase authentication service',
      icon: 'firebase',
      credentials: {
        apiKey: { label: 'API Key', required: true },
        additionalFields: {
          projectId: { label: 'Project ID', required: true },
          authDomain: { label: 'Auth Domain', required: true }
        }
      }
    }
  ];
};

const ApiIntegration = mongoose.model('ApiIntegration', apiIntegrationSchema);

module.exports = ApiIntegration;