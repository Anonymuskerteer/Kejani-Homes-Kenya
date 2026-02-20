
import { useState, useEffect, useRef } from 'react'
import BookingCard from '../../components/BookingCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { getBookings, cancelBooking } from '../../api/bookings'
import { ChevronDown, CalendarDays } from 'lucide-react'

export default function Bookings() {
  const [bookings, setBookings] = useState({
    upcoming: [],
    confirmed: [],
    completed: [],
    cancelled: [],
    pending: [],
  })
  const [activeTab, setActiveTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getBookings()
      // Handle different response formats
      const bookingsList = response.bookings || response.data || []

      // Transform and categorize bookings
      const categorizedBookings = {
        upcoming: [],
        confirmed: [],
        completed: [],
        cancelled: [],
        pending: [],
      }

      bookingsList.forEach(booking => {
        const home = booking.home || booking.listing || booking.property || {}
        const user = booking.user || {}
        
        const transformedBooking = {
          id: booking._id || booking.id,
          _id: booking._id || booking.id,
          propertyName: home.title || booking.propertyName || 'Property',
          location: home.location || home.address || booking.location || '',
          propertyImage: home.images?.[0]?.url || home.images?.[0] || home.image || booking.propertyImage || '/placeholder-home.jpg',
          checkInDate: new Date(booking.checkInDate),
          checkOutDate: new Date(booking.checkOutDate),
          totalPrice: booking.totalPrice || 0,
          status: booking.status || 'pending',
          paymentStatus: booking.paymentStatus || 'pending',
          paymentMethod: booking.paymentMethod || '',
          isRated: booking.isRated || false,
          home: home,
          user: user,
        }

        // Categorize by status
        const status = (booking.status || 'pending').toLowerCase()
        if (categorizedBookings[status]) {
          categorizedBookings[status].push(transformedBooking)
        } else {
          categorizedBookings.pending.push(transformedBooking)
        }
      })

      // Also categorize by date for 'upcoming'
      const now = new Date()
      bookingsList.forEach(booking => {
        const checkIn = new Date(booking.checkInDate)
        const checkOut = new Date(booking.checkOutDate)
        const status = (booking.status || 'pending').toLowerCase()
        
        // If confirmed/pending and check-in is in the future, add to upcoming
        if ((status === 'confirmed' || status === 'pending') && checkIn > now) {
          const home = booking.home || booking.listing || booking.property || {}
          const existingIndex = categorizedBookings.upcoming.findIndex(b => b.id === (booking._id || booking.id))
          
          if (existingIndex === -1) {
            categorizedBookings.upcoming.push({
              id: booking._id || booking.id,
              _id: booking._id || booking.id,
              propertyName: home.title || booking.propertyName || 'Property',
              location: home.location || home.address || booking.location || '',
              propertyImage: home.images?.[0]?.url || home.images?.[0] || home.image || booking.propertyImage || '/placeholder-home.jpg',
              checkInDate: checkIn,
              checkOutDate: checkOut,
              totalPrice: booking.totalPrice || 0,
              status: status,
              paymentStatus: booking.paymentStatus || 'pending',
              paymentMethod: booking.paymentMethod || '',
              isRated: booking.isRated || false,
            })
          }
        }
      })

      setBookings(categorizedBookings)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (bookingId, ratingData) => {
    try {
      // TODO: Implement rating API call when available
      console.log('Rating booking:', bookingId, ratingData)
      setBookings(prev => ({
        ...prev,
        completed: prev.completed.map(booking =>
          booking.id === bookingId || booking._id === bookingId 
            ? { ...booking, isRated: true } 
            : booking
        ),
      }))
    } catch (err) {
      console.error('Failed to rate booking:', err)
    }
  }

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId)
      
      // Move booking from upcoming to cancelled
      const booking = bookings.upcoming.find(b => b.id === bookingId || b._id === bookingId) ||
                      bookings.confirmed.find(b => b.id === bookingId || b._id === bookingId) ||
                      bookings.pending.find(b => b.id === bookingId || b._id === bookingId)
      
      if (booking) {
        setBookings(prev => ({
          ...prev,
          upcoming: prev.upcoming.filter(b => b.id !== bookingId && b._id !== bookingId),
          confirmed: prev.confirmed.filter(b => b.id !== bookingId && b._id !== bookingId),
          pending: prev.pending.filter(b => b.id !== bookingId && b._id !== bookingId),
          cancelled: [...prev.cancelled, { ...booking, status: 'cancelled' }],
        }))
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      setError('Failed to cancel booking. Please try again.')
    }
  }

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: bookings.upcoming.length },
    { id: 'confirmed', label: 'Confirmed', count: bookings.confirmed.length },
    { id: 'pending', label: 'Pending', count: bookings.pending.length },
    { id: 'completed', label: 'Completed', count: bookings.completed.length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.cancelled.length },
  ]

  const currentBookings = bookings[activeTab]
  const activeTabData = tabs.find(tab => tab.id === activeTab)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-4 min-h-full overscroll-contain">
      {/* Page header with dropdown */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">My Bookings</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your property reservations
          </p>
        </div>
        
        {/* Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-full sm:w-auto gap-2 px-4 py-2.5 bg-white dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-dark-background transition-colors"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="font-medium text-dark dark:text-light text-sm">
                {activeTabData?.label}
              </span>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeTabData?.count}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted dark:text-dark-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Options */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[200px] mt-2 bg-white dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-lg z-20 overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setDropdownOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-dark dark:text-light hover:bg-gray-50 dark:hover:bg-dark-background'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-dark-background text-muted dark:text-dark-muted'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState count={3} type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookings} />
      ) : currentBookings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {currentBookings.map(booking => (
            <BookingCard
              key={booking.id || booking._id}
              booking={booking}
              onRate={handleRate}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            activeTab === 'upcoming'
              ? 'No upcoming bookings'
              : activeTab === 'completed'
              ? 'No completed bookings'
              : activeTab === 'confirmed'
              ? 'No confirmed bookings'
              : activeTab === 'pending'
              ? 'No pending bookings'
              : 'No cancelled bookings'
          }
          description={
            activeTab === 'upcoming'
              ? 'You have no upcoming reservations'
              : activeTab === 'completed'
              ? 'You haven\'t completed any bookings yet'
              : activeTab === 'confirmed'
              ? 'You have no confirmed bookings'
              : activeTab === 'pending'
              ? 'You have no pending bookings awaiting confirmation'
              : 'You have no cancelled bookings'
          }
          icon="bookings"
        />
      )}
    </div>
  )
}
