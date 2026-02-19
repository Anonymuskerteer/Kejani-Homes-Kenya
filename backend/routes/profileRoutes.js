const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth, requireRole } = require('../middleware/authMiddleware');
const { profileUpload } = require('../middleware/uploadMiddleware');

router.use(auth);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Profile photo upload - landlord/agency photos go to pending for admin approval
router.post('/upload-profile-photo', profileUpload.single('photo'), profileController.uploadProfilePhoto);

// Admin endpoints for profile photo review
router.get('/pending-photos', requireRole(['admin']), profileController.getPendingProfilePhotos);
router.post('/review-photo/:userId', requireRole(['admin']), profileController.reviewProfilePhoto);

router.get('/:userId', profileController.getUserProfile);
router.put('/:userId', profileController.updateUserProfile);

module.exports = router;
