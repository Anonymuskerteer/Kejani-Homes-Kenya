const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/', auth, bookingController.createBooking);
router.get('/', auth, bookingController.getBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.put('/:id', auth, bookingController.updateBooking);
router.patch('/:id/status', auth, bookingController.updateBookingStatus);
router.post('/:id/cancel', auth, bookingController.cancelBooking);
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
