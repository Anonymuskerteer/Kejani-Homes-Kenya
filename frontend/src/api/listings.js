import axiosInstance from './axios'

export const getListings = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/listings', { params: filters })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch listings' }
  }
}

export const getMyListings = async () => {
  try {
    const response = await axiosInstance.get('/listings/me/listings')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch your listings' }
  }
}

export const getListingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/listings/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch listing' }
  }
}

export const createListing = async (data) => {
  try {
    const response = await axiosInstance.post('/listings', data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create listing' }
  }
}

export const updateListing = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/listings/${id}`, data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update listing' }
  }
}

export const deleteListing = async (id) => {
  try {
    const response = await axiosInstance.delete(`/listings/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete listing' }
  }
}

export const uploadListingImages = async (files) => {
  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    const response = await axiosInstance.post('/listings/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s timeout for uploads
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload images' }
  }
}

export const searchListings = async (query) => {
  try {
    const response = await axiosInstance.get('/listings/search', { params: { q: query } })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search listings' }
  }
}

export const addToFavourites = async (listingId) => {
  try {
    const response = await axiosInstance.post('/favorites', { home: listingId })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add to favourites' }
  }
}

export const removeFromFavourites = async (listingId) => {
  try {
    const response = await axiosInstance.delete(`/favorites/listing/${listingId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove from favourites' }
  }
}

export const getFavourites = async () => {
  try {
    const response = await axiosInstance.get('/favorites')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch favourites' }
  }
}
