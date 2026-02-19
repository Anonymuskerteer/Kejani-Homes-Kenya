export default function ErrorState({ 
  title = 'Something went wrong', 
  description = 'An error occurred. Please try again.',
  message = null,
  onRetry = null 
}) {
  // If message is provided, use it as description
  const displayDescription = message || description;
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4">
        <svg className="w-16 h-16 text-error mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">{title}</h3>
          <p className="text-muted dark:text-dark-muted text-sm max-w-xs">{displayDescription}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="button-primary mt-4">
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
