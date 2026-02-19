import axiosInstance from './axios'

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user' }
  }
}

export const getUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user profile' }
  }
}

export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/users', data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' }
  }
}

export const uploadProfileImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append('photo', file)
    const response = await axiosInstance.post('/users/upload-profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload image' }
  }
}

export const getRatings = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/ratings`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch ratings' }
  }
}

export const addRating = async (userId, data) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/ratings`, data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add rating' }
  }
}

export const logout = async () => {
  try {
    await axiosInstance.post('/auth/logout')
    localStorage.removeItem('token')
  } catch (error) {
    localStorage.removeItem('token')
    throw error
  }
}
