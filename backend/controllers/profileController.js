const User = require('../models/User');
const Home = require('../models/Home');
const Booking = require('../models/Booking');
const cloudinary = require('../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-favorites -bookings -messages');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get additional statistics based on user role
    let stats = {};
    
    if (user.role === 'landlord' || user.role === 'agency') {
      const listings = await Home.find({ owner: user._id });
      stats.totalListings = listings.length;
      stats.activeListings = listings.filter(l => l.status === 'Available').length;
      
      const listingIds = listings.map(l => l._id);
      const bookings = await Booking.find({ listing: { $in: listingIds } });
      stats.totalBookings = bookings.length;
    } else if (user.role === 'tenant') {
      const bookings = await Booking.find({ tenant: user._id });
      stats.completedBookingsCount = bookings.filter(b => b.status === 'completed').length;
    }
    
    res.json({ user, stats });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Prevent landlord/agency from directly changing their profile photo
    // They must use the upload-profile-photo endpoint which requires admin approval
    if (req.user.role === 'landlord' || req.user.role === 'agency') {
      delete updates.landlordProfilePhoto;
      delete updates.companyLogo;
    }
    
    // Remove empty strings and convert to undefined for optional fields
    // This prevents validation errors on optional fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === '') {
        updates[key] = undefined;
      }
    });
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, { 
      new: true, 
      runValidators: false // Don't run full document validation for partial updates
    }).select('-favorites -bookings -messages');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Upload profile photo - goes to pending for admin approval
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only landlord/agency need admin approval
    if (user.role === 'landlord' || user.role === 'agency') {
      user.pendingProfilePhoto = req.file.path; // Cloudinary URL
      user.profilePhotoStatus = 'pending';
      // Save with validateBeforeSave option to skip full document validation
      await user.save({ validateBeforeSave: false });

      res.json({
        message: 'Profile photo uploaded and pending admin approval',
        pendingProfilePhoto: user.pendingProfilePhoto,
        profilePhotoStatus: 'pending',
      });
    } else {
      // Tenants can update directly
      user.landlordProfilePhoto = req.file.path;
      await user.save({ validateBeforeSave: false });

      res.json({
        message: 'Profile photo updated successfully',
        profilePhoto: user.landlordProfilePhoto,
      });
    }
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Server error uploading profile photo' });
  }
};

// Admin: Approve or reject profile photo
exports.reviewProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePhotoStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending profile photo to review' });
    }

    if (action === 'approve') {
      // Move pending photo to active
      user.landlordProfilePhoto = user.pendingProfilePhoto;
      user.pendingProfilePhoto = null;
      user.profilePhotoStatus = 'approved';
      await user.save();

      res.json({
        message: 'Profile photo approved',
        user,
      });
    } else {
      // Reject - delete from Cloudinary and clear pending
      if (user.pendingProfilePhoto) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = user.pendingProfilePhoto.split('/');
          const publicId = urlParts.slice(-2).join('/').replace(/\.[^.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting rejected photo from Cloudinary:', err);
        }
      }

      user.pendingProfilePhoto = null;
      user.profilePhotoStatus = 'rejected';
      await user.save();

      res.json({
        message: 'Profile photo rejected',
        user,
      });
    }
  } catch (error) {
    console.error('Error reviewing profile photo:', error);
    res.status(500).json({ message: 'Server error reviewing profile photo' });
  }
};

// Admin: Get users with pending profile photos
exports.getPendingProfilePhotos = async (req, res) => {
  try {
    const users = await User.find({ profilePhotoStatus: 'pending' })
      .select('firstName lastName email role pendingProfilePhoto landlordProfilePhoto profilePhotoStatus agencyName');
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching pending photos:', error);
    res.status(500).json({ message: 'Server error fetching pending profile photos' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-favorites -bookings -messages');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    Object.assign(user, updates);
    await user.save();
    
    res.json({ 
      message: 'User profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};
