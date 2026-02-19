// Admin Verification API Service
// API endpoints for managing verification requests in admin dashboard

import axios from './axios';

export const getVerificationRequests = async (params = {}) => {
  try {
    const response = await axios.get('/admin/verification', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVerificationById = async (verificationId) => {
  try {
    const response = await axios.get(`/admin/verification/${verificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveVerification = async (verificationId) => {
  try {
    const response = await axios.put(`/admin/verification/${verificationId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectVerification = async (verificationId, reason = '') => {
  try {
    const response = await axios.put(`/admin/verification/${verificationId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestChanges = async (verificationId, feedback = '') => {
  try {
    const response = await axios.put(`/admin/verification/${verificationId}/request-changes`, { feedback });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
