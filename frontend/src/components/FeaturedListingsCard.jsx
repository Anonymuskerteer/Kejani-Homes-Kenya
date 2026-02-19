import { Link } from 'react-router-dom'

export default function FeaturedListingsCard({ listing }) {
  return (
    <div className="bg-white dark:bg-dark-foreground rounded-lg shadow-sm border border-border dark:border-dark-border overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="relative w-full h-40 sm:h-48 bg-gray-100 dark:bg-dark-background overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Location badge */}
        <div className="flex items-center gap-1 text-muted dark:text-dark-muted text-xs sm:text-sm">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{listing.location}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-lg font-semibold text-dark dark:text-light line-clamp-2 leading-tight">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="text-muted dark:text-dark-muted text-xs sm:text-sm line-clamp-2">
          {listing.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg sm:text-2xl font-bold text-primary">KES {listing.price?.toLocaleString()}</span>
          <span className="text-muted dark:text-dark-muted text-xs sm:text-sm">/month</span>
        </div>

        {/* CTA Button */}
        <Link
          to="/login"
          className="button-primary w-full text-center py-2 sm:py-2.5 mt-2 sm:mt-4 block text-sm sm:text-base"
        >
          Know More
        </Link>
      </div>
    </div>
  )
}
