const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { auth, requireRole } = require('../middleware/authMiddleware');
const { listingUpload } = require('../middleware/uploadMiddleware');

// Protected route - must be before /:id to avoid conflict
router.get('/me/listings', auth, homeController.getMyHomes);

// Image upload endpoint - uploads to Cloudinary with compression
router.post('/upload-images', auth, (req, res, next) => {
  listingUpload.array('images', 10)(req, res, (err) => {
    if (err) {
      // Handle Multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum file size is 10MB per image.',
          error: 'FILE_TOO_LARGE'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          message: 'Too many files. Maximum is 10 images.',
          error: 'TOO_MANY_FILES'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          message: 'Unexpected file field.',
          error: 'UNEXPECTED_FILE'
        });
      }
      return res.status(400).json({ 
        message: err.message || 'File upload error',
        error: 'UPLOAD_ERROR'
      });
    }
    
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }

      const imageUrls = req.files.map(file => file.path);
      res.json({
        message: 'Images uploaded successfully',
        images: imageUrls,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: 'Failed to upload images' });
    }
  });
});

// Public routes
router.get('/', homeController.getHomes);
router.get('/:id', homeController.getHomeById);

// Protected routes - require authentication
router.post('/', auth, requireRole(['landlord', 'admin']), (req, res) => {
  console.log('POST /api/listings - User:', req.user?.email, 'Role:', req.user?.role);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  homeController.createHome(req, res);
});
router.put('/:id', auth, homeController.updateHome);
router.delete('/:id', auth, homeController.deleteHome);

module.exports = router;
