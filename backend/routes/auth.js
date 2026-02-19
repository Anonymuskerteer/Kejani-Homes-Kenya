const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', (req, res) => {
  // For JWT tokens, we don't need to do anything server-side
  // The token expires automatically
  res.json({ message: 'Logged out successfully' });
});
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/profile/:userId', authController.getUserProfile);
router.put('/profile/:userId', authController.updateUserProfile);

module.exports = router;
