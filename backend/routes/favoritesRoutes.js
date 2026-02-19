const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { auth } = require('../middleware/authMiddleware');

// All favorites routes require authentication
router.post('/', auth, favoritesController.createFavorite);
router.get('/', auth, favoritesController.getFavorites);
router.get('/:id', auth, favoritesController.getFavoriteById);
router.delete('/:id', auth, favoritesController.deleteFavorite);
router.delete('/listing/:listingId', auth, favoritesController.deleteFavoriteByListing);

module.exports = router;
