export default function EmptyState({ 
  title = 'No items found', 
  description = 'There are no items to display right now.', 
  icon = 'default',
  actionLabel = null,
  onAction = null 
}) {
  const getIcon = () => {
    const icons = {
      default: (
        <svg className="w-16 h-16 text-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      listings: (
        <svg className="w-16 h-16 text-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h3m10-11l2 3m-2-3v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      bookings: (
        <svg className="w-16 h-16 text-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      chat: (
        <svg className="w-16 h-16 text-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      heart: (
        <svg className="w-16 h-16 text-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    }
    return icons[icon] || icons.default
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4">
        {getIcon()}
        <div>
          <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">{title}</h3>
          <p className="text-muted dark:text-dark-muted text-sm max-w-xs">{description}</p>
        </div>
        {actionLabel && onAction && (
          <button onClick={onAction} className="button-primary mt-4">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
