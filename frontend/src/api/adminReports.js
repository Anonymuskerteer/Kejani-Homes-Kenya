// Admin Reports API Service
// API endpoints for managing reports and complaints in admin dashboard

import axios from './axios';

// Get all reports with pagination and filters
export const getReports = async (params = {}) => {
  try {
    const response = await axios.get('/admin/reports', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        status: params.status || '',
        type: params.type || '',
        startDate: params.startDate || '',
        endDate: params.endDate || '',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single report details
export const getReportById = async (reportId) => {
  try {
    const response = await axios.get(`/admin/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Resolve report
export const resolveReport = async (reportId, resolution = '') => {
  try {
    const response = await axios.put(`/admin/reports/${reportId}/resolve`, { resolution });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Dismiss report
export const dismissReport = async (reportId, reason = '') => {
  try {
    const response = await axios.put(`/admin/reports/${reportId}/dismiss`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reopen report
export const reopenReport = async (reportId) => {
  try {
    const response = await axios.put(`/admin/reports/${reportId}/reopen`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get dashboard metrics
export const getDashboardMetrics = async () => {
  try {
    const response = await axios.get('/admin/dashboard/metrics');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get recent activities
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await axios.get('/admin/dashboard/activities', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
