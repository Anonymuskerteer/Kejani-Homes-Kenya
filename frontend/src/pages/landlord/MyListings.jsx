import { useState, useEffect } from 'react'
import LandlordListingCard from '../../components/LandlordListingCard'
import AddListingForm from '../../components/AddListingForm'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import MapDisplay from '../../components/MapDisplay'
import { getMyListings, createListing, updateListing, deleteListing } from '../../api/listings'

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDetailsListing, setSelectedDetailsListing] = useState(null)
  const [detailsImageIndex, setDetailsImageIndex] = useState(0)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMyListings()
      // Map backend home objects to the format the cards expect
      const mapped = (data.homes || []).map(home => ({
        id: home._id,
        title: home.title,
        price: home.rentAmount,
        location: home.address,
        image: home.images?.[0] || '',
        images: home.images || [],
        rentalType: home.rentalType === 'Custom' ? home.customType : home.rentalType,
        status: home.status || (home.isAvailable ? 'Available' : 'Unavailable'),
        amenities: home.amenities || [],
        description: home.description,
        deposit: home.deposit,
        views: home.views || 0,
        inquiries: home.inquiries || 0,
        coordinates: home.coordinates,
        city: home.city,
        _raw: home,
      }))
      setListings(mapped)
    } catch (err) {
      setError(err.message || 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  const handleAddListing = async (formData) => {
    try {
      setSubmitting(true)
      if (editingListing) {
        // Update existing listing
        await updateListing(editingListing.id, formData)
      } else {
        // Create new listing
        await createListing(formData)
      }
      setShowAddForm(false)
      setEditingListing(null)
      // Refresh listings from server
      await fetchListings()
    } catch (err) {
      console.error('Failed to save listing:', err)
      alert(err.message || 'Failed to save listing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditListing = (listing) => {
    setEditingListing(listing)
    setShowAddForm(true)
  }

  const handleDeleteListing = async (listingId) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteListing(listingId)
        setListings(prev => prev.filter(l => l.id !== listingId))
      } catch (err) {
        console.error('Failed to delete listing:', err)
        alert(err.message || 'Failed to delete listing. Please try again.')
      }
    }
  }

  const handleViewDetails = (listingId) => {
    const listing = listings.find(l => l.id === listingId)
    if (listing) {
      setSelectedDetailsListing(listing)
      setDetailsImageIndex(0)
    }
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingListing(null)
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-light">My Listings</h1>
          <p className="text-muted dark:text-dark-muted mt-1">{listings.length} properties</p>
        </div>
        <button
          onClick={() => {
            setEditingListing(null)
            setShowAddForm(true)
          }}
          className="button-primary w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Listing
        </button>
      </div>

      {/* Listings grid */}
      {loading ? (
        <LoadingState count={6} type="card" />
      ) : error ? (
        <ErrorState onRetry={fetchListings} />
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => (
            <LandlordListingCard
              key={listing.id}
              listing={listing}
              onEdit={handleEditListing}
              onDelete={handleDeleteListing}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No listings yet"
          description="Create your first property listing to get started"
          icon="listings"
        />
      )}

      {/* Add listing form modal */}
      {showAddForm && (
        <AddListingForm
          listing={editingListing}
          onSubmit={handleAddListing}
          onClose={handleCloseForm}
        />
      )}

      {/* Listing Details Modal */}
      {selectedDetailsListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-foreground rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header with close button */}
            <div className="sticky top-0 bg-white dark:bg-dark-foreground border-b border-border dark:border-dark-border p-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-dark dark:text-light">Listing Details</h2>
              <button
                onClick={() => setSelectedDetailsListing(null)}
                className="text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-6">
              {/* Image carousel */}
              <div className="space-y-2">
                <div className="relative bg-gray-100 dark:bg-dark-background rounded-lg overflow-hidden aspect-video">
                  {selectedDetailsListing.images && selectedDetailsListing.images.length > 0 ? (
                    <>
                      <img
                        src={selectedDetailsListing.images[detailsImageIndex]}
                        alt={`Listing ${detailsImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedDetailsListing.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setDetailsImageIndex((prev) =>
                                prev === 0 ? selectedDetailsListing.images.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              setDetailsImageIndex((prev) =>
                                prev === selectedDetailsListing.images.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {selectedDetailsListing.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setDetailsImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  idx === detailsImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {selectedDetailsListing.images && selectedDetailsListing.images.length > 1 && (
                  <p className="text-xs text-muted dark:text-dark-muted text-center">
                    {detailsImageIndex + 1} / {selectedDetailsListing.images.length}
                  </p>
                )}
              </div>

              {/* Title and status */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-dark dark:text-light">{selectedDetailsListing.title}</h3>
                    <p className="text-muted dark:text-dark-muted mt-1">{selectedDetailsListing.rentalType}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white whitespace-nowrap ${
                      selectedDetailsListing.status === 'Available'
                        ? 'bg-success'
                        : selectedDetailsListing.status === 'Booked'
                        ? 'bg-primary'
                        : 'bg-gray-500'
                    }`}
                  >
                    {selectedDetailsListing.status}
                  </span>
                </div>
              </div>

              {/* Price and location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted dark:text-dark-muted mb-1">Price</p>
                  <p className="text-2xl font-bold text-primary">Ksh {selectedDetailsListing.price.toLocaleString()}</p>
                  <p className="text-xs text-muted dark:text-dark-muted mt-1">/month</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted dark:text-dark-muted mb-1">Location</p>
                  <p className="text-dark dark:text-light flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {selectedDetailsListing.location}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-foreground dark:bg-dark-foreground rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedDetailsListing.views}</p>
                  <p className="text-xs text-muted dark:text-dark-muted mt-1">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedDetailsListing.inquiries}</p>
                  <p className="text-xs text-muted dark:text-dark-muted mt-1">Inquiries</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-dark dark:text-light">Deposit</p>
                  <p className="text-lg font-bold text-primary mt-1">Ksh {(selectedDetailsListing.deposit || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              {selectedDetailsListing.description && (
                <div>
                  <h4 className="font-semibold text-dark dark:text-light mb-2">Description</h4>
                  <p className="text-muted dark:text-dark-muted text-sm leading-relaxed">{selectedDetailsListing.description}</p>
                </div>
              )}

              {/* Amenities */}
              {selectedDetailsListing.amenities && selectedDetailsListing.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-dark dark:text-light mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDetailsListing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-muted dark:text-dark-muted text-sm">
                        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location on Map */}
              {selectedDetailsListing.coordinates && 
                (selectedDetailsListing.coordinates.lat !== 0 || selectedDetailsListing.coordinates.lng !== 0) && (
                <div>
                  <h4 className="font-semibold text-dark dark:text-light mb-3">Location on Map</h4>
                  <MapDisplay
                    coordinates={selectedDetailsListing.coordinates}
                    address={selectedDetailsListing.location}
                    height="200px"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-border dark:border-dark-border">
                <button
                  onClick={() => {
                    setEditingListing(selectedDetailsListing)
                    setShowAddForm(true)
                    setSelectedDetailsListing(null)
                  }}
                  className="button-primary flex-1"
                >
                  Edit Listing
                </button>
                <button
                  onClick={() => setSelectedDetailsListing(null)}
                  className="button-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
