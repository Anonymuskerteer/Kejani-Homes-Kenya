const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const homeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  address: {
    type: String,
    required: true,
    maxlength: 500
  },
  city: {
    type: String,
    maxlength: 100,
    default: ''
  },
  county: {
    type: String,
    maxlength: 100,
    default: ''
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deposit: {
    type: Number,
    min: 0,
    default: 0
  },
  rentalType: {
    type: String,
    enum: ['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', 'Custom'],
    default: 'Single Room'
  },
  customType: {
    type: String,
    maxlength: 100,
    default: ''
  },
  bedrooms: {
    type: Number,
    min: 0,
    default: 1
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 1
  },
  squareFootage: {
    type: Number,
    min: 0,
    default: 0
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Unavailable'],
    default: 'Available'
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
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

// Encrypt sensitive fields before saving
homeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Encrypt address if it's been modified and not already encrypted
  if (this.isModified('address') && this.address && !this.address.startsWith('enc:')) {
    this.address = encrypt(this.address);
  }

  // Encrypt city if it's been modified and not already encrypted
  if (this.isModified('city') && this.city && !this.city.startsWith('enc:')) {
    this.city = encrypt(this.city);
  }

  next();
});

// Encrypt on findOneAndUpdate as well
homeSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.address && !update.address.startsWith('enc:')) {
    update.address = encrypt(update.address);
  }
  if (update.city && !update.city.startsWith('enc:')) {
    update.city = encrypt(update.city);
  }
  if (!update.updatedAt) {
    update.updatedAt = Date.now();
  }
  next();
});

// Decrypt sensitive fields after reading from DB
function decryptFields(doc) {
  if (!doc) return doc;
  if (doc.address) doc.address = decrypt(doc.address);
  if (doc.city) doc.city = decrypt(doc.city);
  return doc;
}

homeSchema.post('find', function(docs) {
  docs.forEach(decryptFields);
});

homeSchema.post('findOne', function(doc) {
  decryptFields(doc);
});

homeSchema.post('findOneAndUpdate', function(doc) {
  decryptFields(doc);
});

homeSchema.post('save', function(doc) {
  decryptFields(doc);
});

module.exports = mongoose.model('Home', homeSchema);
