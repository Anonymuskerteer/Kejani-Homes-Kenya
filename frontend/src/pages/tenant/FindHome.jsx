import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingCard from '../../components/ListingCard'
import FilterBar from '../../components/FilterBar'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { getListings, addToFavourites, removeFromFavourites } from '../../api/listings'
import { getCurrentUser } from '../../api/users'

export default function FindHome() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [userCounty, setUserCounty] = useState('')

  // Fetch user's county on mount
  useEffect(() => {
    const loadUserCounty = async () => {
      try {
        const data = await getCurrentUser()
        const county = data.user?.tenantCounty || ''
        setUserCounty(county)
      } catch (err) {
        console.error('Could not fetch user county:', err)
      }
    }
    loadUserCounty()
  }, [])

  useEffect(() => {
    fetchListings()
  }, [filters, searchQuery, userCounty])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        ...filters,
        search: searchQuery || undefined,
        userCounty: userCounty || undefined,
      }

      const data = await getListings(params)

      // Map backend home objects to the format the cards expect
      const mapped = (data.homes || []).map(home => ({
        id: home._id,
        title: home.title,
        price: home.rentAmount,
        location: home.address,
        county: home.county || '',
        image: home.images?.[0] || '',
        images: home.images || [],
        amenities: home.amenities || [],
        rentalType: home.rentalType === 'Custom' ? home.customType : home.rentalType,
        status: home.status || (home.isAvailable ? 'Available' : 'Unavailable'),
        description: home.description,
        deposit: home.deposit,
        owner: home.owner,
        rating: 0,
        reviewCount: 0,
        isFavourite: false,
      }))

      setListings(mapped)
    } catch (err) {
      setError(err.message || 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  const handleFavouriteToggle = async (listingId, isFavourite) => {
    try {
      if (isFavourite) {
        await addToFavourites(listingId)
      } else {
        await removeFromFavourites(listingId)
      }
      
      setListings(prev =>
        prev.map(listing =>
          listing.id === listingId ? { ...listing, isFavourite } : listing
        )
      )
    } catch (err) {
      console.error('Failed to update favourite:', err)
    }
  }

  const handleViewDetails = (listingId) => {
    navigate(`/dashboard/listings/${listingId}`)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  return (
    <div className="space-y-4">
      {/* County indicator */}
      {userCounty && (
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-card text-sm">
          📍 Showing listings in <strong>{userCounty}</strong> first
        </div>
      )}

      {/* Search and filter bar - always at top */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="button-secondary px-4 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Desktop horizontal filter bar */}
        <div className="hidden lg:block">
          <FilterBar 
            onFiltersChange={handleFiltersChange} 
            onResetFilters={handleResetFilters}
            isOpen={true} 
            variant="horizontal" 
          />
        </div>
      </div>

      {/* Listings grid - full width */}
      <div>
        {loading ? (
          <LoadingState count={6} type="card" />
        ) : error ? (
          <ErrorState onRetry={fetchListings} />
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onFavouriteToggle={handleFavouriteToggle}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings found"
            description="Try adjusting your filters or search query. Click below to reset all filters."
            icon="listings"
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        )}
      </div>

      {/* Mobile filter drawer */}
      <FilterBar
        onFiltersChange={handleFiltersChange}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  )
}
