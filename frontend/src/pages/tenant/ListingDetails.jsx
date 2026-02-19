import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListingById, getListings, addToFavourites, removeFromFavourites } from '../../api/listings'
import { getCurrentUser } from '../../api/users'
import { createConversation } from '../../api/chat'
import ListingCard from '../../components/ListingCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function ListingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavourite, setIsFavourite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [suggestedListings, setSuggestedListings] = useState([])
  const [userCounty, setUserCounty] = useState('')

  useEffect(() => {
    fetchListing()
    fetchUserCounty()
  }, [id])

  useEffect(() => {
    if (listing) {
      fetchSuggested()
    }
  }, [listing, userCounty])

  const fetchUserCounty = async () => {
    try {
      const data = await getCurrentUser()
      setUserCounty(data.user?.tenantCounty || '')
    } catch (err) {
      // Not critical
    }
  }

  const fetchListing = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getListingById(id)
      const home = data.home
      setListing({
        id: home._id,
        title: home.title,
        description: home.description,
        price: home.rentAmount,
        deposit: home.deposit || 0,
        location: home.address,
        county: home.county || '',
        city: home.city || '',
        images: home.images || [],
        amenities: home.amenities || [],
        rentalType: home.rentalType === 'Custom' ? home.customType : home.rentalType,
        status: home.status || (home.isAvailable ? 'Available' : 'Unavailable'),
        bedrooms: home.bedrooms || 0,
        bathrooms: home.bathrooms || 0,
        squareFootage: home.squareFootage || 0,
        coordinates: home.coordinates || { lat: 0, lng: 0 },
        views: home.views || 0,
        inquiries: home.inquiries || 0,
        owner: home.owner || {},
        createdAt: home.createdAt,
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch listing')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggested = async () => {
    try {
      const params = {
        userCounty: listing?.county || userCounty || undefined,
      }
      const data = await getListings(params)
      const mapped = (data.homes || [])
        .filter(h => h._id !== id) // exclude current listing
        .slice(0, 6)
        .map(home => ({
          id: home._id,
          title: home.title,
          price: home.rentAmount,
          location: home.address,
          county: home.county || '',
          image: home.images?.[0] || '',
          amenities: home.amenities || [],
          rentalType: home.rentalType === 'Custom' ? home.customType : home.rentalType,
          status: home.status || 'Available',
          isFavourite: false,
        }))
      setSuggestedListings(mapped)
    } catch (err) {
      // Not critical
    }
  }

  const handleFavouriteToggle = async () => {
    try {
      if (isFavourite) {
        await removeFromFavourites(listing.id)
      } else {
        await addToFavourites(listing.id)
      }
      setIsFavourite(!isFavourite)
    } catch (err) {
      console.error('Failed to update favourite:', err)
    }
  }

  const handleOpenMaps = () => {
    const address = listing.location || ''
    const county = listing.county || ''
    const query = encodeURIComponent(`${address}, ${county}, Kenya`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const handleBookVisit = () => {
    // Navigate to bookings or open a booking modal
    alert('Book a visit feature - this will create a booking request for this property.')
  }

  const handleStartChat = async () => {
    if (!listing?.owner?._id) {
      console.error('Owner ID not available')
      return
    }
    
    try {
      // Create a default message for the conversation
      const defaultMessage = `Hi! I'm interested in your property "${listing.title}" located at ${listing.location}. Could you please provide more information about availability and viewing times?`
      
      // Create or get existing conversation with the landlord
      const response = await createConversation({
        recipientId: listing.owner._id,
        initialMessage: defaultMessage
      })
      
      // Navigate to chat page with the conversation
      navigate('/dashboard/chat', { 
        state: { 
          conversationId: response.conversation?._id || response.conversation,
          recipientId: listing.owner._id 
        } 
      })
    } catch (err) {
      console.error('Failed to start chat:', err)
      // Still navigate to chat page even if conversation creation fails
      navigate('/dashboard/chat')
    }
  }

  const handleSuggestedViewDetails = (listingId) => {
    navigate(`/dashboard/listings/${listingId}`)
  }

  const handleSuggestedFavourite = async (listingId, fav) => {
    try {
      if (fav) {
        await addToFavourites(listingId)
      } else {
        await removeFromFavourites(listingId)
      }
    } catch (err) {
      console.error('Failed to update favourite:', err)
    }
  }

  const nextImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState onRetry={fetchListing} />
  if (!listing) return <ErrorState title="Listing not found" />

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Listings
      </button>

      {/* Image gallery */}
      <div className="relative rounded-lg overflow-hidden bg-gray-200 dark:bg-dark-background">
        {listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[currentImageIndex]}
              alt={`${listing.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-dark-foreground/80 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-dark-foreground transition-colors"
                >
                  <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-dark-foreground/80 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-dark-foreground transition-colors"
                >
                  <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {listing.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-64 sm:h-80 md:h-96 flex items-center justify-center text-muted dark:text-dark-muted">
            <p>No images available</p>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3 bg-primary text-white text-sm font-medium px-3 py-1 rounded-md">
          {listing.status}
        </div>
      </div>

      {/* Image thumbnails */}
      {listing.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {listing.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === currentImageIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main info card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-light">{listing.title}</h1>
            <div className="flex items-center gap-1 text-muted dark:text-dark-muted mt-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{listing.location}{listing.county ? `, ${listing.county}` : ''}</span>
            </div>
            <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-dark-background text-muted dark:text-dark-muted px-2 py-1 rounded">
              {listing.rentalType}
            </span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">KES {listing.price?.toLocaleString()}</p>
            <p className="text-muted dark:text-dark-muted text-sm">per month</p>
            {listing.deposit > 0 && (
              <p className="text-muted dark:text-dark-muted text-sm mt-1">
                Deposit: KES {listing.deposit?.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleFavouriteToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-card border transition-colors ${
              isFavourite
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'border-border dark:border-dark-border text-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-background'
            }`}
          >
            <svg
              className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`}
              fill={isFavourite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isFavourite ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={handleOpenMaps}
            className="flex items-center gap-2 px-4 py-2.5 rounded-card border border-border dark:border-dark-border text-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-background transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            View on Map
          </button>

          <button
            onClick={handleBookVisit}
            className="button-primary flex items-center gap-2 flex-1 justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book a Visit
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h2 className="text-lg font-semibold text-dark dark:text-light mb-3">Description</h2>
        <p className="text-muted dark:text-dark-muted whitespace-pre-line">{listing.description}</p>
      </div>

      {/* Property details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">Property Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {listing.bedrooms > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-dark-background rounded-card">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <div>
                <p className="text-sm text-muted dark:text-dark-muted">Bedrooms</p>
                <p className="font-semibold text-dark dark:text-light">{listing.bedrooms}</p>
              </div>
            </div>
          )}
          {listing.bathrooms > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-dark-background rounded-card">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <p className="text-sm text-muted dark:text-dark-muted">Bathrooms</p>
                <p className="font-semibold text-dark dark:text-light">{listing.bathrooms}</p>
              </div>
            </div>
          )}
          {listing.squareFootage > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-dark-background rounded-card">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <div>
                <p className="text-sm text-muted dark:text-dark-muted">Area</p>
                <p className="font-semibold text-dark dark:text-light">{listing.squareFootage} sq ft</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-dark-background rounded-card">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <div>
              <p className="text-sm text-muted dark:text-dark-muted">Views</p>
              <p className="font-semibold text-dark dark:text-light">{listing.views}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {listing.amenities.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-dark-background text-dark dark:text-light rounded-card text-sm border border-transparent dark:border-dark-border"
              >
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Owner info */}
      {listing.owner && (
        <div className="card">
          <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">Listed By</h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={listing.owner.landlordProfilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.owner.email}`}
                alt={`${listing.owner.firstName} ${listing.owner.lastName}`}
                className="w-14 h-14 rounded-full object-cover border-2 border-border dark:border-dark-border"
              />
              <div>
                <p className="font-semibold text-dark dark:text-light">
                  {listing.owner.agencyName || `${listing.owner.firstName} ${listing.owner.lastName}`}
                </p>
                <p className="text-sm text-muted dark:text-dark-muted capitalize">{listing.owner.role}</p>
              </div>
            </div>
            <button
              onClick={handleStartChat}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-card hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="hidden sm:inline">Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Location - Google Maps button */}
      <div className="card">
        <h2 className="text-lg font-semibold text-dark dark:text-light mb-3">Location</h2>
        <p className="text-muted dark:text-dark-muted mb-4">
          {listing.location}{listing.county ? `, ${listing.county} County` : ''}
          {listing.city ? `, ${listing.city}` : ''}
        </p>
        <button
          onClick={handleOpenMaps}
          className="button-secondary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Open in Google Maps
        </button>
      </div>

      {/* Suggested listings */}
      {suggestedListings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-light mb-4">Similar Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedListings.map(item => (
              <ListingCard
                key={item.id}
                listing={item}
                onFavouriteToggle={handleSuggestedFavourite}
                onViewDetails={handleSuggestedViewDetails}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
