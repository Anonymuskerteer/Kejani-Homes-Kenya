
// Admin Listings API Service
// API endpoints for managing property listings in admin dashboard

import axios from './axios';

// Get all listings with pagination and filters
export const getListings = async (params = {}) => {
  try {
    const response = await axios.get('/admin/listings', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        status: params.status || '',
        owner: params.owner || '',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single listing details
export const getListingById = async (listingId) => {
  try {
    const response = await axios.get(`/admin/listings/${listingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve listing
export const approveListing = async (listingId) => {
  try {
    const response = await axios.put(`/admin/listings/${listingId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject listing
export const rejectListing = async (listingId, reason = '') => {
  try {
    const response = await axios.put(`/admin/listings/${listingId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Flag listing
export const flagListing = async (listingId, reason = '') => {
  try {
    const response = await axios.put(`/admin/listings/${listingId}/flag`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove listing
export const removeListing = async (listingId) => {
  try {
    const response = await axios.delete(`/admin/listings/${listingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
