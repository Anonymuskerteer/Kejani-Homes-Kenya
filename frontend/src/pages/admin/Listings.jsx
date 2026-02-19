// Listings Management Module
// Moderate property listings with approve, remove, and flag actions

import { useState, useEffect } from 'react'
import { getListings, approveListing, rejectListing, flagListing, removeListing } from '../../api/adminListings'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { bg: 'bg-warning/10', text: 'text-warning' },
    approved: { bg: 'bg-success/10', text: 'text-success' },
    flagged: { bg: 'bg-error/10', text: 'text-error' },
    rejected: { bg: 'bg-error/10', text: 'text-error' },
  }

  const config = statusConfig[status] || statusConfig.pending
  return (
    <span className={`absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} capitalize`}>
      {status}
    </span>
  )
}

export default function Listings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: '', type: '' })
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchListings()
  }, [pagination.page, filters])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getListings({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        type: filters.type,
      })
      setListings(response.listings || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (err) {
      setError(err.message || 'Failed to fetch listings')
      console.error('Listings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price)
  }

  const handleApprove = async (listing) => {
    try {
      setActionLoading(listing.id)
      await approveListing(listing.id)
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'approved' } : l))
    } catch (err) {
      console.error('Approve error:', err)
      alert(err.message || 'Failed to approve listing')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (listing) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason === null) return

    try {
      setActionLoading(listing.id)
      await rejectListing(listing.id, reason)
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'rejected' } : l))
    } catch (err) {
      console.error('Reject error:', err)
      alert(err.message || 'Failed to reject listing')
    } finally {
      setActionLoading(null)
    }
  }

  const handleFlag = async (listing) => {
    const reason = prompt('Please provide a reason for flagging:')
    if (reason === null) return

    try {
      setActionLoading(listing.id)
      await flagListing(listing.id, reason)
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'flagged' } : l))
    } catch (err) {
      console.error('Flag error:', err)
      alert(err.message || 'Failed to flag listing')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (listing) => {
    if (!confirm('Are you sure you want to remove this listing?')) return

    try {
      setActionLoading(listing.id)
      await removeListing(listing.id)
      setListings(prev => prev.filter(l => l.id !== listing.id))
    } catch (err) {
      console.error('Remove error:', err)
      alert(err.message || 'Failed to remove listing')
    } finally {
      setActionLoading(null)
    }
  }

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      value: filters.status,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'flagged', label: 'Flagged' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      value: filters.type,
      options: [
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'studio', label: 'Studio' },
        { value: 'bedsitter', label: 'Bedsitter' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-light">Listings Management</h1>
        <p className="text-muted dark:text-dark-muted mt-1">Moderate and manage property listings on the platform.</p>
      </div>

      {/* Search and Filters */}
      <div className="card dark:bg-dark-foreground space-y-4">
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Search listings by title, location or owner..."
            value={filters.search}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, search: e.target.value }))
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="input-field text-sm flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map(filter => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="input-field text-sm px-3 py-2"
            >
              <option value="">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <LoadingState count={6} type="card" />
      ) : error ? (
        <ErrorState onRetry={fetchListings} />
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="card dark:bg-dark-foreground overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* Image with status */}
              <div className="relative h-48 bg-foreground dark:bg-dark-background overflow-hidden rounded-t-lg">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
                  }}
                />
                <StatusBadge status={listing.status} />
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-dark dark:text-light line-clamp-2">{listing.title}</h3>
                <p className="text-sm text-muted dark:text-dark-muted mt-1">{listing.location}</p>

                <div className="flex items-center gap-4 mt-3 text-sm border-b border-border dark:border-dark-border pb-3">
                  <span className="text-muted dark:text-dark-muted">{listing.type}</span>
                  <span className="text-primary font-semibold">{formatPrice(listing.price)}/mo</span>
                </div>

                <p className="text-sm text-muted dark:text-dark-muted mt-3">Owner: {listing.owner}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 flex-wrap">
                  {listing.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(listing)}
                        disabled={actionLoading === listing.id}
                        className="flex-1 py-2 px-3 bg-success text-white text-sm font-medium rounded-lg hover:bg-success-hover disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(listing)}
                        disabled={actionLoading === listing.id}
                        className="flex-1 py-2 px-3 border border-border dark:border-dark-border text-dark dark:text-light text-sm font-medium rounded-lg hover:bg-foreground dark:hover:bg-dark-background disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {listing.status === 'approved' && (
                    <button
                      onClick={() => handleFlag(listing)}
                      disabled={actionLoading === listing.id}
                      className="flex-1 py-2 px-3 border border-warning bg-warning/5 text-warning text-sm font-medium rounded-lg hover:bg-warning/10 disabled:opacity-50 transition-colors"
                    >
                      Flag
                    </button>
                  )}

                  {listing.status === 'flagged' && (
                    <button
                      onClick={() => handleRemove(listing)}
                      disabled={actionLoading === listing.id}
                      className="flex-1 py-2 px-3 border border-error bg-error/5 text-error text-sm font-medium rounded-lg hover:bg-error/10 disabled:opacity-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}

                  <button
                    className="p-2 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light hover:bg-foreground dark:hover:bg-dark-background rounded-lg transition-colors"
                    title="View details"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card dark:bg-dark-foreground text-center py-12">
          <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-dark dark:text-light font-medium">No listings found</p>
          <p className="text-muted dark:text-dark-muted text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {listings.length > 0 && (
        <div className="card dark:bg-dark-foreground flex items-center justify-between">
          <div className="text-sm text-muted dark:text-dark-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} listings
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-dark dark:text-light bg-foreground dark:bg-dark-background rounded disabled:opacity-50 hover:bg-border dark:hover:bg-dark-border transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-3 py-2 text-sm font-medium text-dark dark:text-light bg-foreground dark:bg-dark-background rounded disabled:opacity-50 hover:bg-border dark:hover:bg-dark-border transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
