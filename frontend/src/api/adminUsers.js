// Admin Users API Service
// API endpoints for managing users in admin dashboard

import axios from './axios';

// Get all users with pagination and filters
export const getUsers = async (params = {}) => {
  try {
    const response = await axios.get('/admin/users', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        role: params.role || '',
        status: params.status || '',
        verified: params.verified || '',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single user details
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify user
export const verifyUser = async (userId) => {
  try {
    const response = await axios.put(`/admin/users/${userId}/verify`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Suspend user
export const suspendUser = async (userId, reason = '') => {
  try {
    const response = await axios.put(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unsuspend user
export const unsuspendUser = async (userId) => {
  try {
    const response = await axios.put(`/admin/users/${userId}/unsuspend`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
