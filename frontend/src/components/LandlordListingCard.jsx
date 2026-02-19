export default function LandlordListingCard({ listing, onEdit, onDelete, onViewDetails }) {
  return (
    <div className="bg-white dark:bg-dark-foreground rounded-lg shadow-sm border border-border dark:border-dark-border overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image container */}
      <div className="relative h-36 sm:h-44 md:h-48 bg-gray-100 dark:bg-dark-background overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Status badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium text-white shadow-sm ${
              listing.status === 'Available'
                ? 'bg-green-500'
                : listing.status === 'Booked'
                ? 'bg-primary'
                : 'bg-gray-500'
            }`}
          >
            {listing.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title and rental type */}
        <div className="min-h-[3rem] sm:min-h-[3.5rem]">
          <h3 className="font-semibold text-sm sm:text-base text-dark dark:text-light line-clamp-2 hover:text-primary cursor-pointer leading-tight">
            {listing.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted dark:text-dark-muted mt-0.5 sm:mt-1">{listing.rentalType}</p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted dark:text-dark-muted text-xs sm:text-sm">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-border dark:border-dark-border">
          <div className="text-center">
            <p className="text-sm sm:text-lg font-bold text-primary">{listing.views}</p>
            <p className="text-[10px] sm:text-xs text-muted dark:text-dark-muted">Views</p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-lg font-bold text-primary">{listing.inquiries}</p>
            <p className="text-[10px] sm:text-xs text-muted dark:text-dark-muted">Inquiries</p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-lg font-bold text-primary">Ksh {listing.price.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted dark:text-dark-muted">/month</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 sm:gap-2 pt-2 sm:pt-4">
          <button
            onClick={() => onViewDetails(listing.id)}
            className="flex-1 button-secondary text-xs sm:text-sm py-1.5 sm:py-2"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(listing)}
            className="button-primary px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center justify-center gap-1"
            title="Edit listing"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => onDelete(listing.id)}
            className="bg-red-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-red-600 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
            title="Delete listing"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
