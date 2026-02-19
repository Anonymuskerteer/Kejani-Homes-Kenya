import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed. Please try again.',
      data: error.response?.data // Include full response data for unverified users
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Registration failed. Please try again.' 
    };
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Email verification failed. Please try again.' 
    };
  }
};

export const verifyOTP = async (otp, otpToken) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', { otp, otpToken });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'OTP verification failed. Please try again.' 
    };
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/resend-otp', { email });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to resend OTP. Please try again.' 
    };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/request-password-reset', { email });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to request password reset. Please try again.' 
    };
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', resetData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Password reset failed. Please try again.' 
    };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getUserAvatar = (user) => {
  if (!user) return null;
  
  // If user has a custom avatar, use it
  if (user.avatar) return user.avatar;
  if (user.landlordProfilePhoto) return user.landlordProfilePhoto;
  
  // Generate gender-specific avatar
  const email = user.email || '';
  if (user.gender) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&gender=${user.gender}`;
  }
  
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};