const mongoose = require('mongoose');
const { isEmail } = require('validator');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true
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

favoriteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Favorite', favoriteSchema);