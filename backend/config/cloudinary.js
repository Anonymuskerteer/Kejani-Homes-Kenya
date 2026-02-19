const cloudinary = require('cloudinary').v2;

// Debug: Log environment variables status (remove after debugging)
console.log('[Cloudinary Config] CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
console.log('[Cloudinary Config] CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('[Cloudinary Config] CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
console.log('[Cloudinary Config] Current working directory:', process.cwd());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
