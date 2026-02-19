// Admin Routes
// All routes require authentication and admin role
// Routes for dashboard, users, listings, verification, reports, and settings

const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Middleware for all admin routes
router.use(auth);
router.use(requireRole(['admin']));

// ============================================
// DASHBOARD ROUTES
// ============================================

// GET /api/admin/dashboard/metrics
// Get dashboard statistics
router.get('/dashboard/metrics', adminController.getDashboardMetrics);

// GET /api/admin/dashboard/activities
// Get recent activities
router.get('/dashboard/activities', adminController.getRecentActivities);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// GET /api/admin/users
// Get all users with pagination and filters
router.get('/users', adminController.getUsers);

// GET /api/admin/users/:id
// Get single user details
router.get('/users/:id', adminController.getUserById);

// PUT /api/admin/users/:id/verify
// Verify a user
router.put('/users/:id/verify', adminController.verifyUser);

// PUT /api/admin/users/:id/suspend
// Suspend a user
router.put('/users/:id/suspend', adminController.suspendUser);

// PUT /api/admin/users/:id/unsuspend
// Unsuspend a user
router.put('/users/:id/unsuspend', adminController.unsuspendUser);

// ============================================
// LISTINGS MANAGEMENT ROUTES
// ============================================

// GET /api/admin/listings
// Get all listings with pagination and filters
router.get('/listings', adminController.getListings);

// GET /api/admin/listings/:id
// Get single listing details
router.get('/listings/:id', adminController.getListingById);

// PUT /api/admin/listings/:id/approve
// Approve a listing
router.put('/listings/:id/approve', adminController.approveListing);

// PUT /api/admin/listings/:id/reject
// Reject a listing
router.put('/listings/:id/reject', adminController.rejectListing);

// PUT /api/admin/listings/:id/flag
// Flag a listing
router.put('/listings/:id/flag', adminController.flagListing);

// DELETE /api/admin/listings/:id
// Remove a listing
router.delete('/listings/:id', adminController.removeListing);

// ============================================
// VERIFICATION ROUTES
// ============================================

// GET /api/admin/verification
// Get verification requests
router.get('/verification', adminController.getVerificationRequests);

// PUT /api/admin/verification/:id/approve
// Approve verification request
router.put('/verification/:id/approve', adminController.approveVerification);

// PUT /api/admin/verification/:id/reject
// Reject verification request
router.put('/verification/:id/reject', adminController.rejectVerification);

// PUT /api/admin/verification/:id/request-changes
// Request changes for verification
router.put('/verification/:id/request-changes', adminController.requestChanges);

// ============================================
// REPORTS ROUTES
// ============================================

// GET /api/admin/reports
// Get all reports
router.get('/reports', adminController.getReports);

// PUT /api/admin/reports/:id/resolve
// Resolve a report
router.put('/reports/:id/resolve', adminController.resolveReport);

// PUT /api/admin/reports/:id/dismiss
// Dismiss a report
router.put('/reports/:id/dismiss', adminController.dismissReport);

// PUT /api/admin/reports/:id/reopen
// Reopen a report
router.put('/reports/:id/reopen', adminController.reopenReport);

// ============================================
// SETTINGS ROUTES
// ============================================

// GET /api/admin/settings
// Get admin account settings
router.get('/settings', adminController.getAdminSettings);

// PUT /api/admin/settings
// Update admin account settings
router.put('/settings', adminController.updateAdminSettings);

// GET /api/admin/settings/platform
// Get platform settings
router.get('/settings/platform', adminController.getPlatformSettings);

// PUT /api/admin/settings/platform
// Update platform settings
router.put('/settings/platform', adminController.updatePlatformSettings);

// PUT /api/admin/settings/password
// Change admin password
router.put('/settings/password', adminController.changeAdminPassword);

module.exports = router;