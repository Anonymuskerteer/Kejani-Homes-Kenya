const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage for listing images
const listingStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kejani-homes/listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  },
});

// Storage for profile photos - smaller, square crop
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kejani-homes/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  },
});

// Storage for chat images - optimized for chat
const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kejani-homes/chat-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const listingUpload = multer({
  storage: listingStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 10,
  },
  fileFilter,
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB max for profile photos
    files: 1,
  },
  fileFilter,
});

const chatUpload = multer({
  storage: chatStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for chat images
    files: 1,
  },
  fileFilter,
});

module.exports = { listingUpload, profileUpload, chatUpload };
