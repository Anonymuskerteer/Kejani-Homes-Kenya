// Admin Settings API Service
// API endpoints for managing admin settings

import axios from './axios';

// Get admin account settings
export const getAdminSettings = async () => {
  try {
    const response = await axios.get('/admin/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update admin account settings
export const updateAdminSettings = async (settings) => {
  try {
    const response = await axios.patch('/admin/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get platform settings
export const getPlatformSettings = async () => {
  try {
    const response = await axios.get('/admin/settings/platform');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update platform settings
export const updatePlatformSettings = async (settings) => {
  try {
    const response = await axios.patch('/admin/settings/platform', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  try {
    const response = await axios.get('/admin/settings/notifications');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await axios.patch('/admin/settings/notifications', preferences);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change admin password
export const changeAdminPassword = async (passwordData) => {
  try {
    const response = await axios.post('/admin/settings/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};