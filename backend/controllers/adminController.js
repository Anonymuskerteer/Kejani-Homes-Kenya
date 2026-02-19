// Admin Controller
// Handles all admin operations including user management, listings moderation,
// verification, reports, and dashboard statistics

const mongoose = require('mongoose');
const User = require('../models/User');
const Home = require('../models/Home');
const Booking = require('../models/Booking');
const Message = require('../models/Message');

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get dashboard metrics
 * Returns total users, active listings, bookings today, pending reports
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get total users count
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const usersLastMonth = await User.countDocuments({ 
      role: { $ne: 'admin' },
      createdAt: { $lt: lastMonth }
    });
    const usersTrend = usersLastMonth > 0 
      ? Math.round(((totalUsers - usersLastMonth) / usersLastMonth) * 100) 
      : 100;

    // Get active listings count
    const activeListings = await Home.countDocuments({ isAvailable: true });
    const listingsLastMonth = await Home.countDocuments({ 
      isAvailable: true,
      createdAt: { $lt: lastMonth }
    });
    const listingsTrend = listingsLastMonth > 0 
      ? Math.round(((activeListings - listingsLastMonth) / listingsLastMonth) * 100) 
      : 100;

    // Get bookings today
    const bookingsToday = await Booking.countDocuments({
      createdAt: { $gte: today }
    });
    const bookingsYesterday = await Booking.countDocuments({
      createdAt: { $gte: new Date(today.getTime() - 86400000), $lt: today }
    });
    const bookingsTrend = bookingsYesterday > 0 
      ? Math.round(((bookingsToday - bookingsYesterday) / bookingsYesterday) * 100) 
      : (bookingsToday > 0 ? 100 : 0);

    // Get pending reports (users with issues or flagged content)
    // For now, we'll count users with profilePhotoStatus === 'pending'
    const reportsPending = await User.countDocuments({ 
      profilePhotoStatus: 'pending' 
    });
    const reportsLastWeek = await User.countDocuments({ 
      profilePhotoStatus: 'pending',
      updatedAt: { $lt: lastWeek }
    });
    const reportsTrend = reportsLastWeek > 0 
      ? Math.round(((reportsPending - reportsLastWeek) / reportsLastWeek) * 100) 
      : 0;

    res.json({
      success: true,
      metrics: {
        totalUsers,
        usersTrend,
        activeListings,
        listingsTrend,
        bookingsToday,
        bookingsTrend,
        reportsPending,
        reportsTrend
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard metrics',
      error: error.message 
    });
  }
};

/**
 * Get recent activities
 * Returns recent user registrations, listings, and other activities
 */
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = [];

    // Get recent user registrations
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName role createdAt');

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user',
        message: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
        time: formatTimeAgo(user.createdAt),
        timestamp: user.createdAt
      });
    });

    // Get recent listings
    const recentListings = await Home.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'firstName lastName')
      .select('title createdAt owner');

    recentListings.forEach(listing => {
      activities.push({
        id: `listing-${listing._id}`,
        type: 'listing',
        message: `New listing created: ${listing.title}`,
        time: formatTimeAgo(listing.createdAt),
        timestamp: listing.createdAt
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      activities: limitedActivities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activities',
      error: error.message 
    });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users with pagination and filters
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status, verified } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query
    const query = { role: { $ne: 'admin' } };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { tenantPhone: { $regex: search, $options: 'i' } },
        { landlordPhone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'suspended') {
        query.isActive = false;
      }
    }
    
    if (verified !== undefined && verified !== '') {
      query.isEmailVerified = verified === 'true';
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -otp -otpToken -otpExpires -emailVerificationToken -passwordResetToken');

    const total = await User.countDocuments(query);

    // Transform users for frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.tenantPhone || user.landlordPhone || null,
      role: user.role,
      status: user.isActive ? 'active' : 'suspended',
      verified: user.isEmailVerified,
      createdAt: user.createdAt,
      profilePhoto: user.landlordProfilePhoto || user.companyLogo || null
    }));

    res.json({
      success: true,
      users: transformedUsers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

/**
 * Get single user details
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findById(id)
      .select('-password -otp -otpToken -otpExpires -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get user's listings count if landlord/agency
    let listingsCount = 0;
    if (user.role === 'landlord' || user.role === 'agency') {
      listingsCount = await Home.countDocuments({ owner: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.tenantPhone || user.landlordPhone || null,
        role: user.role,
        status: user.isActive ? 'active' : 'suspended',
        verified: user.isEmailVerified,
        createdAt: user.createdAt,
        profilePhoto: user.landlordProfilePhoto || user.companyLogo || null,
        agencyName: user.agencyName,
        registrationNumber: user.registrationNumber,
        listingsCount
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user',
      error: error.message 
    });
  }
};

/**
 * Verify a user (mark email as verified)
 */
const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isEmailVerified: true },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: user._id,
        verified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify user',
      error: error.message 
    });
  }
};

/**
 * Suspend a user
 */
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: {
        id: user._id,
        status: 'suspended'
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to suspend user',
      error: error.message 
    });
  }
};

/**
 * Unsuspend a user
 */
const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        $unset: { suspendedAt: 1, suspensionReason: 1 }
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User unsuspended successfully',
      user: {
        id: user._id,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unsuspend user',
      error: error.message 
    });
  }
};

// ============================================
// LISTINGS MANAGEMENT
// ============================================

/**
 * Get all listings with pagination and filters
 */
const getListings = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { county: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      if (status === 'approved') {
        query.isAvailable = true;
        query.status = 'Available';
      } else if (status === 'pending') {
        query.isAvailable = true;
        query.status = 'Available';
      } else if (status === 'flagged') {
        query.isFlagged = true;
      } else if (status === 'rejected') {
        query.isAvailable = false;
        query.status = 'Unavailable';
      }
    }
    
    if (type) {
      query.rentalType = type;
    }

    const listings = await Home.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'firstName lastName email role');

    const total = await Home.countDocuments(query);

    // Transform listings for frontend
    const transformedListings = listings.map(listing => ({
      id: listing._id,
      title: listing.title,
      type: listing.rentalType,
      price: listing.rentAmount,
      deposit: listing.deposit,
      city: listing.city,
      county: listing.county,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      images: listing.images,
      status: listing.isFlagged ? 'flagged' : (listing.isAvailable ? 'approved' : 'rejected'),
      createdAt: listing.createdAt,
      owner: listing.owner ? {
        id: listing.owner._id,
        name: `${listing.owner.firstName} ${listing.owner.lastName}`,
        email: listing.owner.email,
        role: listing.owner.role
      } : null
    }));

    res.json({
      success: true,
      listings: transformedListings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch listings',
      error: error.message 
    });
  }
};

/**
 * Get single listing details
 */
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid listing ID format' 
      });
    }

    const listing = await Home.findById(id)
      .populate('owner', 'firstName lastName email role phone');

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      listing: {
        id: listing._id,
        title: listing.title,
        description: listing.description,
        address: listing.address,
        city: listing.city,
        county: listing.county,
        rentAmount: listing.rentAmount,
        deposit: listing.deposit,
        rentalType: listing.rentalType,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        amenities: listing.amenities,
        images: listing.images,
        coordinates: listing.coordinates,
        isAvailable: listing.isAvailable,
        status: listing.isFlagged ? 'flagged' : (listing.isAvailable ? 'approved' : 'rejected'),
        views: listing.views,
        inquiries: listing.inquiries,
        createdAt: listing.createdAt,
        owner: listing.owner
      }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch listing',
      error: error.message 
    });
  }
};

/**
 * Approve a listing
 */
const approveListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid listing ID format' 
      });
    }

    const listing = await Home.findByIdAndUpdate(
      id,
      { 
        isAvailable: true, 
        status: 'Available',
        isFlagged: false,
        $unset: { flagReason: 1, rejectionReason: 1 }
      },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      message: 'Listing approved successfully',
      listing: {
        id: listing._id,
        status: 'approved'
      }
    });
  } catch (error) {
    console.error('Approve listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve listing',
      error: error.message 
    });
  }
};

/**
 * Reject a listing
 */
const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid listing ID format' 
      });
    }

    const listing = await Home.findByIdAndUpdate(
      id,
      { 
        isAvailable: false, 
        status: 'Unavailable',
        rejectionReason: reason || 'No reason provided',
        rejectedAt: new Date()
      },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      message: 'Listing rejected successfully',
      listing: {
        id: listing._id,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Reject listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject listing',
      error: error.message 
    });
  }
};

/**
 * Flag a listing
 */
const flagListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid listing ID format' 
      });
    }

    const listing = await Home.findByIdAndUpdate(
      id,
      { 
        isFlagged: true, 
        flagReason: reason || 'No reason provided',
        flaggedAt: new Date()
      },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      message: 'Listing flagged successfully',
      listing: {
        id: listing._id,
        status: 'flagged'
      }
    });
  } catch (error) {
    console.error('Flag listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to flag listing',
      error: error.message 
    });
  }
};

/**
 * Remove a listing (soft delete)
 */
const removeListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid listing ID format' 
      });
    }

    const listing = await Home.findByIdAndDelete(id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({
      success: true,
      message: 'Listing removed successfully'
    });
  } catch (error) {
    console.error('Remove listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove listing',
      error: error.message 
    });
  }
};

// ============================================
// VERIFICATION MANAGEMENT
// ============================================

/**
 * Get verification requests
 */
const getVerificationRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query - look for users with pending profile photos
    const query = { 
      $or: [
        { profilePhotoStatus: 'pending' },
        { profilePhotoStatus: 'approved' },
        { profilePhotoStatus: 'rejected' }
      ]
    };
    
    if (type) {
      query.role = type;
    }
    
    if (status) {
      query.profilePhotoStatus = status;
    }

    const users = await User.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -otp -otpToken -otpExpires');

    const total = await User.countDocuments(query);

    // Transform for frontend
    const requests = users.map(user => ({
      id: user._id,
      type: user.role,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.tenantPhone || user.landlordPhone || null,
      status: user.profilePhotoStatus,
      documentUrl: user.pendingProfilePhoto || user.landlordProfilePhoto,
      agencyName: user.agencyName,
      registrationNumber: user.registrationNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      requests,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch verification requests',
      error: error.message 
    });
  }
};

/**
 * Approve verification request
 */
const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        profilePhotoStatus: 'approved',
        landlordProfilePhoto: this.pendingProfilePhoto,
        $unset: { pendingProfilePhoto: 1 }
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({
      success: true,
      message: 'Verification approved successfully',
      request: {
        id: user._id,
        status: 'approved'
      }
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve verification',
      error: error.message 
    });
  }
};

/**
 * Reject verification request
 */
const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        profilePhotoStatus: 'rejected',
        verificationRejectionReason: reason || 'No reason provided',
        $unset: { pendingProfilePhoto: 1 }
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({
      success: true,
      message: 'Verification rejected',
      request: {
        id: user._id,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject verification',
      error: error.message 
    });
  }
};

/**
 * Request changes for verification
 */
const requestChanges = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        profilePhotoStatus: 'rejected',
        verificationFeedback: feedback || 'Changes requested'
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({
      success: true,
      message: 'Changes requested successfully',
      request: {
        id: user._id,
        status: 'changes_requested'
      }
    });
  } catch (error) {
    console.error('Request changes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to request changes',
      error: error.message 
    });
  }
};

// ============================================
// REPORTS MANAGEMENT
// ============================================

/**
 * Get reports (using profile photo status as proxy for reports)
 */
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // For now, we'll use users with profile photo issues as "reports"
    // In a real app, you'd have a separate Report model
    const query = {};
    
    if (type) {
      if (type === 'user') {
        query.role = { $in: ['tenant', 'landlord', 'agency'] };
      } else if (type === 'listing') {
        // Would query a reports collection
      }
    }
    
    if (status) {
      query.profilePhotoStatus = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with profile photo status issues
    const users = await User.find({
      ...query,
      profilePhotoStatus: { $in: ['pending', 'rejected'] }
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -otp -otpToken -otpExpires');

    const total = await User.countDocuments({
      ...query,
      profilePhotoStatus: { $in: ['pending', 'rejected'] }
    });

    // Transform for frontend
    const reports = users.map(user => ({
      id: user._id,
      type: 'user',
      reportedBy: 'System',
      reportedUser: `${user.firstName} ${user.lastName}`,
      reason: user.verificationRejectionReason || 'Profile photo verification required',
      status: user.profilePhotoStatus === 'pending' ? 'pending' : 'resolved',
      createdAt: user.updatedAt,
      resolvedAt: user.profilePhotoStatus === 'approved' ? user.updatedAt : null
    }));

    res.json({
      success: true,
      reports,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reports',
      error: error.message 
    });
  }
};

/**
 * Resolve a report
 */
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        profilePhotoStatus: 'approved',
        resolutionNote: resolution
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      message: 'Report resolved successfully',
      report: {
        id: user._id,
        status: 'resolved'
      }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resolve report',
      error: error.message 
    });
  }
};

/**
 * Dismiss a report
 */
const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        profilePhotoStatus: 'rejected',
        dismissalReason: reason
      },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      message: 'Report dismissed',
      report: {
        id: user._id,
        status: 'dismissed'
      }
    });
  } catch (error) {
    console.error('Dismiss report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to dismiss report',
      error: error.message 
    });
  }
};

/**
 * Reopen a report
 */
const reopenReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { profilePhotoStatus: 'pending' },
      { new: true }
    ).select('-password -otp -otpToken -otpExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      message: 'Report reopened',
      report: {
        id: user._id,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Reopen report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reopen report',
      error: error.message 
    });
  }
};

// ============================================
// SETTINGS
// ============================================

/**
 * Get admin settings
 */
const getAdminSettings = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('firstName lastName email');
    
    res.json({
      success: true,
      settings: {
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admin settings',
      error: error.message 
    });
  }
};

/**
 * Update admin settings
 */
const updateAdminSettings = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const admin = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email },
      { new: true }
    ).select('firstName lastName email');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update admin settings',
      error: error.message 
    });
  }
};

/**
 * Get platform settings
 */
const getPlatformSettings = async (req, res) => {
  try {
    // In a real app, these would be stored in a Settings model
    // For now, return default values
    res.json({
      success: true,
      settings: {
        maintenanceMode: false,
        userRegistration: true,
        autoApproveListings: false,
        maxListingsPerLandlord: 50,
        maxImagesPerListing: 10
      }
    });
  } catch (error) {
    console.error('Get platform settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform settings',
      error: error.message 
    });
  }
};

/**
 * Update platform settings
 */
const updatePlatformSettings = async (req, res) => {
  try {
    // In a real app, these would be saved to a Settings model
    // For now, just return success
    res.json({
      success: true,
      message: 'Platform settings updated successfully',
      settings: req.body
    });
  } catch (error) {
    console.error('Update platform settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update platform settings',
      error: error.message 
    });
  }
};

/**
 * Change admin password
 */
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await User.findById(req.user._id).select('+password');
    
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password',
      error: error.message 
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format time ago from date
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(date).toLocaleDateString();
}

module.exports = {
  // Dashboard
  getDashboardMetrics,
  getRecentActivities,
  
  // Users
  getUsers,
  getUserById,
  verifyUser,
  suspendUser,
  unsuspendUser,
  
  // Listings
  getListings,
  getListingById,
  approveListing,
  rejectListing,
  flagListing,
  removeListing,
  
  // Verification
  getVerificationRequests,
  approveVerification,
  rejectVerification,
  requestChanges,
  
  // Reports
  getReports,
  resolveReport,
  dismissReport,
  reopenReport,
  
  // Settings
  getAdminSettings,
  updateAdminSettings,
  getPlatformSettings,
  updatePlatformSettings,
  changeAdminPassword
};