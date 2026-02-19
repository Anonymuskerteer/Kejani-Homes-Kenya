const Favorite = require('../models/Favorite');
const Home = require('../models/Home');

exports.createFavorite = async (req, res) => {
  try {
    const { home: homeId } = req.body;
    const userId = req.user._id;

    // Check if home exists
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ user: userId, home: homeId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    const favorite = new Favorite({ user: userId, home: homeId });
    await favorite.save();

    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate('user', 'name email')
      .populate('home', 'title location price images amenities');

    res.status(201).json({ 
      message: 'Added to favorites successfully', 
      favorite: populatedFavorite 
    });
  } catch (error) {
    console.error('Error creating favorite:', error);
    res.status(500).json({ message: 'Server error creating favorite' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'home',
        select: 'title location price images amenities rentalType county deposit description status',
      })
      .sort({ createdAt: -1 });

    // Filter out favorites where home was deleted
    const validFavorites = favorites.filter(fav => fav.home);

    res.json({ favourites: validFavorites, favorites: validFavorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};

exports.getFavoriteById = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorite = await Favorite.findOne({ 
      _id: req.params.id, 
      user: userId 
    })
      .populate('user', 'name email')
      .populate('home', 'title location price images amenities');

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ favorite });
  } catch (error) {
    console.error('Error fetching favorite:', error);
    res.status(500).json({ message: 'Server error fetching favorite' });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorite = await Favorite.findOneAndDelete({ 
      _id: req.params.id, 
      user: userId 
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({ message: 'Server error deleting favorite' });
  }
};

exports.deleteFavoriteByListing = async (req, res) => {
  try {
    const userId = req.user._id;
    const { listingId } = req.params;

    const favorite = await Favorite.findOneAndDelete({ 
      user: userId, 
      home: listingId 
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({ message: 'Server error deleting favorite' });
  }
};
