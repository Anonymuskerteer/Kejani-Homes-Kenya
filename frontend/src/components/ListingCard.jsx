import { useState, useEffect } from 'react'

export default function ListingCard({ listing, onFavouriteToggle, onViewDetails }) {
  const [isFavourite, setIsFavourite] = useState(listing?.isFavourite || false)
  
  // Get the listing ID (handle both id and _id)
  const listingId = listing?.id || listing?._id

  // Update isFavourite when listing prop changes
  useEffect(() => {
    setIsFavourite(listing?.isFavourite || false)
  }, [listing?.isFavourite])

  const handleFavouriteClick = (e) => {
    e.stopPropagation()
    setIsFavourite(!isFavourite)
    if (onFavouriteToggle) {
      onFavouriteToggle(listingId, !isFavourite)
    }
  }

  return (
    <div 
      className="bg-white dark:bg-dark-foreground rounded-lg shadow-sm border border-border dark:border-dark-border p-3 sm:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(listingId)}
    >
      {/* Image container */}
      <div className="relative mb-3 sm:mb-4 -m-3 sm:-m-4 rounded-t-lg overflow-hidden bg-gray-100 dark:bg-dark-background h-36 sm:h-44 md:h-48">
        <img
          src={listing?.image || 'https://via.placeholder.com/400x300?text=Property'}
          alt={listing?.title}
          className="w-full h-full object-cover"
        />
        
        {/* Favourite button */}
        <button
          onClick={handleFavouriteClick}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 dark:bg-dark-foreground/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <svg
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
              isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-dark-muted'
            }`}
            fill={isFavourite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Status badge */}
        {listing?.status && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
            {listing.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1.5 sm:space-y-2">
        {/* Title and Price */}
        <div className="min-h-[3.5rem] sm:min-h-[4rem]">
          <h3 className="font-semibold text-sm sm:text-base text-dark dark:text-light line-clamp-2 leading-tight mb-1">
            {listing?.title}
          </h3>
          <p className="text-base sm:text-lg font-bold text-primary">
            KES {listing?.price?.toLocaleString()}
            <span className="text-xs sm:text-sm font-normal text-muted dark:text-dark-muted ml-1">/month</span>
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted dark:text-dark-muted text-xs sm:text-sm">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{listing?.location}</span>
        </div>

        {/* Amenities */}
        {listing?.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
            {listing.amenities.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx} 
                className="text-[10px] sm:text-xs bg-gray-100 dark:bg-dark-background/80 text-muted dark:text-dark-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-transparent dark:border-dark-border/50"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="text-[10px] sm:text-xs bg-gray-100 dark:bg-dark-background/80 text-muted dark:text-dark-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-transparent dark:border-dark-border/50">
                +{listing.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating and reviews */}
        {listing?.rating && (
          <div className="flex items-center gap-1 text-xs sm:text-sm pt-1 sm:pt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    i < Math.floor(listing.rating) 
                      ? 'text-secondary fill-secondary' 
                      : 'text-gray-300 dark:text-dark-muted dark:fill-dark-muted/30'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-muted dark:text-dark-muted">({listing.reviewCount || 0})</span>
          </div>
        )}

        {/* View details button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails?.(listingId)
          }}
          className="w-full button-primary mt-2 sm:mt-4 text-sm sm:text-base py-2 sm:py-2.5"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
