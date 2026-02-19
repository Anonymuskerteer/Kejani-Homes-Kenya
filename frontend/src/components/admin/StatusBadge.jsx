// StatusBadge Component
// Reusable status badge with multiple status types
// Supports dark mode and different sizes

import PropTypes from 'prop-types';

const statusConfig = {
  // User/Listing statuses
  active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
  pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
  approved: { bg: 'bg-success/10', text: 'text-success', label: 'Approved' },
  rejected: { bg: 'bg-error/10', text: 'text-error', label: 'Rejected' },
  suspended: { bg: 'bg-error/10', text: 'text-error', label: 'Suspended' },
  flagged: { bg: 'bg-error/10', text: 'text-error', label: 'Flagged' },
  
  // Report statuses
  resolved: { bg: 'bg-success/10', text: 'text-success', label: 'Resolved' },
  dismissed: { bg: 'bg-muted/10', text: 'text-muted', label: 'Dismissed' },
  open: { bg: 'bg-primary/10', text: 'text-primary', label: 'Open' },
  
  // Verification statuses
  verified: { bg: 'bg-success/10', text: 'text-success', label: 'Verified' },
  unverified: { bg: 'bg-warning/10', text: 'text-warning', label: 'Unverified' },
  changes_requested: { bg: 'bg-warning/10', text: 'text-warning', label: 'Changes Requested' },
  
  // Booking statuses
  confirmed: { bg: 'bg-success/10', text: 'text-success', label: 'Confirmed' },
  cancelled: { bg: 'bg-error/10', text: 'text-error', label: 'Cancelled' },
  completed: { bg: 'bg-primary/10', text: 'text-primary', label: 'Completed' },
  
  // Default
  default: { bg: 'bg-muted/10', text: 'text-muted', label: 'Unknown' },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function StatusBadge({ status, size = 'md', showDot = false }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
  const sizeClass = sizeConfig[size] || sizeConfig.md;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium capitalize ${config.bg} ${config.text} ${sizeClass}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`}></span>
      )}
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showDot: PropTypes.bool,
};
