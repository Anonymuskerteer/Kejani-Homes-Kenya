export default function LoadingState({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="card space-y-4 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-dark-background rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-dark-background rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-background rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-dark-background rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="card p-4 flex gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-background rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-dark-background rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-dark-background rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-center py-12">
      <div className="animate-spin">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"></circle>
          <path
            d="M12 2a10 10 0 010 20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          ></path>
        </svg>
      </div>
    </div>
  )
}
