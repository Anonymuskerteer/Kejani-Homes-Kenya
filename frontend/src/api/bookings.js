import axiosInstance from './axios'

export const getBookings = async (status = null) => {
  try {
    const params = status ? { status } : {}
    const response = await axiosInstance.get('/bookings', { params })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' }
  }
}

export const getBookingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/bookings/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking' }
  }
}

export const createBooking = async (data) => {
  try {
    const response = await axiosInstance.post('/bookings', data)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create booking' }
  }
}

export const updateBookingStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/bookings/${id}/status`, { status })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update booking' }
  }
}

export const cancelBooking = async (id) => {
  try {
    const response = await axiosInstance.post(`/bookings/${id}/cancel`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel booking' }
  }
}

export const getUpcomingBookings = async () => {
  try {
    const response = await axiosInstance.get('/bookings', { params: { status: 'upcoming' } })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch upcoming bookings' }
  }
}

export const getCompletedBookings = async () => {
  try {
    const response = await axiosInstance.get('/bookings', { params: { status: 'completed' } })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch completed bookings' }
  }
}
