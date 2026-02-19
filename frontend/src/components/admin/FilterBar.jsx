// FilterBar Component
// Reusable filter bar with search and dropdown filters
// Supports dark mode

import PropTypes from 'prop-types';

export default function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters = [],
  onFilterChange,
  className = '',
}) {
  return (
    <div className={`card dark:bg-dark-foreground space-y-4 ${className}`}>
      {/* Search Input */}
      {onSearchChange && (
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted dark:text-dark-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field text-sm pl-10 w-full"
            />
          </div>
        </div>
      )}

      {/* Filter Dropdowns */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
              className="input-field text-sm px-3 py-2"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}

FilterBar.propTypes = {
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ),
  onFilterChange: PropTypes.func,
  className: PropTypes.string,
};
