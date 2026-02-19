// AdminTable Component
// Reusable data table with sorting, pagination, and loading states
// Supports dark mode and API-ready design

import PropTypes from 'prop-types';
import LoadingState from '../LoadingState';
import EmptyState from '../EmptyState';
import ErrorState from '../ErrorState';

export default function AdminTable({
  columns,
  data,
  loading,
  error,
  emptyMessage = 'No data available',
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  pagination,
  onPageChange,
}) {
  if (loading) {
    return <LoadingState message="Loading data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="bg-white dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-foreground dark:bg-dark-background border-b border-border dark:border-dark-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-border dark:hover:bg-dark-border' : ''}`}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sortColumn === column.key && (
                      <svg className={`w-4 h-4 text-primary ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className={`hover:bg-foreground dark:hover:bg-dark-background transition-colors ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-dark dark:text-light">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-dark-border">
          <p className="text-sm text-muted dark:text-dark-muted">
            Showing {pagination.page * pagination.limit - pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange?.(pagination.page - 1)} 
              disabled={pagination.page === 1} 
              className="px-3 py-1 text-sm border border-border dark:border-dark-border rounded-lg text-muted dark:text-dark-muted hover:bg-foreground dark:hover:bg-dark-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-dark dark:text-light">Page {pagination.page} of {pagination.totalPages}</span>
            <button 
              onClick={() => onPageChange?.(pagination.page + 1)} 
              disabled={pagination.page === pagination.totalPages} 
              className="px-3 py-1 text-sm border border-border dark:border-dark-border rounded-lg text-muted dark:text-dark-muted hover:bg-foreground dark:hover:bg-dark-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

AdminTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  onSort: PropTypes.func,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
};
