// Admin API Management Service
// API endpoints for managing API keys and integrations in admin dashboard

import axios from './axios';

// =====================
// API Statistics
// =====================

// Get API statistics
export const getApiStats = async () => {
  try {
    const response = await axios.get('/admin/api/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// =====================
// API Keys
// =====================

// Get all API keys with pagination and filters
export const getApiKeys = async (params = {}) => {
  try {
    const response = await axios.get('/admin/api/keys', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || '',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single API key details
export const getApiKeyById = async (keyId) => {
  try {
    const response = await axios.get(`/admin/api/keys/${keyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new API key
export const createApiKey = async (data) => {
  try {
    const response = await axios.post('/admin/api/keys', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update API key
export const updateApiKey = async (keyId, data) => {
  try {
    const response = await axios.put(`/admin/api/keys/${keyId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete API key
export const deleteApiKey = async (keyId) => {
  try {
    const response = await axios.delete(`/admin/api/keys/${keyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Regenerate API key secret
export const regenerateApiKeySecret = async (keyId) => {
  try {
    const response = await axios.post(`/admin/api/keys/${keyId}/regenerate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle API key status
export const toggleApiKeyStatus = async (keyId) => {
  try {
    const response = await axios.patch(`/admin/api/keys/${keyId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// =====================
// Integration Templates
// =====================

// Get integration templates
export const getIntegrationTemplates = async () => {
  try {
    const response = await axios.get('/admin/api/integrations/templates');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// =====================
// Integrations
// =====================

// Get all integrations with pagination and filters
export const getIntegrations = async (params = {}) => {
  try {
    const response = await axios.get('/admin/api/integrations', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        type: params.type || '',
        status: params.status || '',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single integration details
export const getIntegrationById = async (integrationId) => {
  try {
    const response = await axios.get(`/admin/api/integrations/${integrationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new integration
export const createIntegration = async (data) => {
  try {
    const response = await axios.post('/admin/api/integrations', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update integration
export const updateIntegration = async (integrationId, data) => {
  try {
    const response = await axios.put(`/admin/api/integrations/${integrationId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete integration
export const deleteIntegration = async (integrationId) => {
  try {
    const response = await axios.delete(`/admin/api/integrations/${integrationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle integration status
export const toggleIntegrationStatus = async (integrationId) => {
  try {
    const response = await axios.patch(`/admin/api/integrations/${integrationId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Test integration connection
export const testIntegration = async (integrationId) => {
  try {
    const response = await axios.post(`/admin/api/integrations/${integrationId}/test`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};