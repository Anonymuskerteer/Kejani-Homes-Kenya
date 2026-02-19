// MetricCard Component
// Dashboard metric card with icon, value, and trend indicator
// Supports dark mode

import PropTypes from 'prop-types';

export default function MetricCard({ title, value, trend, trendLabel, icon: Icon, loading }) {
  const isPositive = trend >= 0;

  if (loading) {
    return (
      <div className="card dark:bg-dark-foreground animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-foreground dark:bg-dark-background rounded w-20"></div>
            <div className="h-8 bg-foreground dark:bg-dark-background rounded w-16"></div>
            <div className="h-3 bg-foreground dark:bg-dark-background rounded w-24"></div>
          </div>
          <div className="w-12 h-12 bg-foreground dark:bg-dark-background rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card dark:bg-dark-foreground">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted dark:text-dark-muted text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-primary mt-2">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-success' : 'text-error'}`}>
              <svg className={`w-4 h-4 ${!isPositive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
              </svg>
              {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number,
  trendLabel: PropTypes.string,
  icon: PropTypes.elementType,
  loading: PropTypes.bool,
};
