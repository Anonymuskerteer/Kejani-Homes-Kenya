import { useState } from 'react'

export default function BookingCard({ booking, onRate, onCancel }) {
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'completed':
        return 'bg-success/10 text-success'
      case 'cancelled':
        return 'bg-error/10 text-error'
      default:
        return 'bg-gray-100 text-dark dark:bg-dark-background dark:text-light'
    }
  }

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleRatingSubmit = () => {
    if (onRate) {
      onRate(booking.id, { rating, review })
      setShowRatingForm(false)
      setReview('')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="card space-y-3 sm:space-y-4">
      {/* Booking header with image and status */}
      <div className="flex gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-border dark:border-dark-border">
        <img
          src={booking?.propertyImage || 'https://via.placeholder.com/120x100?text=Property'}
          alt={booking?.propertyName}
          className="w-14 h-14 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0 py-0.5 sm:py-1">
          <h3 className="font-semibold text-dark dark:text-light text-sm sm:text-base line-clamp-2 leading-tight">{booking?.propertyName}</h3>
          <p className="text-xs sm:text-sm text-muted dark:text-dark-muted line-clamp-1 mt-0.5">{booking?.location}</p>
          <div className={`inline-block text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded mt-1.5 sm:mt-2 ${getStatusColor(booking?.status)}`}>
            {getStatusLabel(booking?.status)}
          </div>
        </div>
      </div>

      {/* Booking details */}
      <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
        <div className="flex items-center justify-between">
          <span className="text-muted dark:text-dark-muted text-xs sm:text-sm">Check-in:</span>
          <span className="font-medium text-dark dark:text-light text-xs sm:text-base">{formatDate(booking?.checkInDate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted dark:text-dark-muted text-xs sm:text-sm">Check-out:</span>
          <span className="font-medium text-dark dark:text-light text-xs sm:text-base">{formatDate(booking?.checkOutDate)}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-border dark:border-dark-border">
          <span className="font-medium text-dark dark:text-light text-xs sm:text-sm">Total Price:</span>
          <span className="text-sm sm:text-lg font-bold text-primary">KES {booking?.totalPrice?.toLocaleString()}</span>
        </div>
      </div>

      {/* Rating section for completed bookings */}
      {booking?.status === 'completed' && !booking?.isRated && (
        <div className="pt-3 sm:pt-4 border-t border-border dark:border-dark-border">
          {!showRatingForm ? (
            <button
              onClick={() => setShowRatingForm(true)}
              className="button-secondary w-full text-sm sm:text-base py-2"
            >
              Rate This Booking
            </button>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-light mb-1.5 sm:mb-2">Rating</label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-xl sm:text-2xl transition-colors p-0.5 sm:p-1"
                    >
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= rating ? 'text-secondary fill-secondary' : 'text-gray-300 dark:text-dark-muted'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-light mb-1.5 sm:mb-2">Review (optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  className="input-field text-xs sm:text-sm"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRatingSubmit}
                  className="button-primary flex-1 text-sm sm:text-base py-2"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowRatingForm(false)}
                  className="button-secondary flex-1 text-sm sm:text-base py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel button for upcoming, pending, and confirmed bookings */}
      {(booking?.status === 'upcoming' || booking?.status === 'pending' || booking?.status === 'confirmed') && (
        <div className="pt-3 sm:pt-4 border-t border-border dark:border-dark-border">
          <button
            onClick={() => onCancel?.(booking.id || booking?._id)}
            className="button-secondary w-full text-error text-sm sm:text-base py-2"
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  )
}
