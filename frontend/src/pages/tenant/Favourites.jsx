import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingCard from '../../components/ListingCard'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { getFavourites, removeFromFavourites } from '../../api/listings'

export default function Favourites() {
  const navigate = useNavigate()
  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFavourites()
  }, [])

  const fetchFavourites = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getFavourites()
      // Handle different response formats
      const favouritesList = response.favourites || response.favorites || response.data || []
      
      // Transform the data to match ListingCard expected format
      const transformedFavourites = favouritesList.map(fav => {
        // Handle populated home data or direct listing data
        const home = fav.home || fav.listing || fav
        return {
          id: home._id || home.id || fav._id,
          _id: home._id || home.id || fav._id,
          title: home.title || 'Untitled Listing',
          price: home.price || 0,
          location: home.location || home.address || '',
          image: home.images?.[0]?.url || home.images?.[0] || home.image || '/placeholder-home.jpg',
          images: home.images || [],
          amenities: home.amenities || [],
          rating: home.rating || home.averageRating || 0,
          reviewCount: home.reviewCount || home.totalReviews || 0,
          status: home.status || 'Available',
          isFavourite: true,
          rentalType: home.rentalType || home.propertyType || '',
          county: home.county || '',
          deposit: home.deposit || 0,
          description: home.description || '',
        }
      })

      setFavourites(transformedFavourites)
    } catch (err) {
      console.error('Failed to fetch favourites:', err)
      setError(err.message || 'Failed to fetch favourites')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavourite = async (listingId) => {
    try {
      await removeFromFavourites(listingId)
      setFavourites(prev => prev.filter(listing => listing.id !== listingId && listing._id !== listingId))
    } catch (err) {
      console.error('Failed to remove favourite:', err)
      // Show error to user
      setError('Failed to remove from favourites. Please try again.')
    }
  }

  const handleViewDetails = (listingId) => {
    // Navigate to listing details page using React Router
    navigate(`/dashboard/listings/${listingId}`)
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Saved Listings</h1>
        <p className="text-text-secondary text-sm mt-1">
          {favourites.length} listing{favourites.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState count={3} type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFavourites} />
      ) : favourites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favourites.map(listing => (
            <ListingCard
              key={listing.id || listing._id}
              listing={listing}
              onFavouriteToggle={() => handleRemoveFavourite(listing.id || listing._id)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved listings yet"
          description="Start saving your favorite properties to view them later"
          icon="heart"
        />
      )}
    </div>
  )
}
