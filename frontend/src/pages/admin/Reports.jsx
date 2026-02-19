// Reports Module
// Handle complaints and flagged content
// API-ready with loading, error, and empty states

import { useState, useEffect } from 'react'
import {
  getReports,
  resolveReport,
  dismissReport,
  reopenReport
} from '../../api/adminReports'
import AdminTable from '../../components/admin/AdminTable'
import StatusBadge from '../../components/admin/StatusBadge'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({ type: '', status: '', search: '' })
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [modalResolution, setModalResolution] = useState('')

  useEffect(() => {
    fetchReports()
  }, [pagination.page, filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getReports({
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type,
        status: filters.status,
        search: filters.search,
      })
      setReports(response.reports || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (err) {
      setError(err.message || 'Failed to fetch reports')
      console.error('Reports fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (report) => {
    setSelectedReport(report)
    setModalAction('view')
    setShowModal(true)
  }

  const handleResolve = async (report, resolution) => {
    try {
      setActionLoading(report.id)
      await resolveReport(report.id, resolution)
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r))
      closeModal()
    } catch (err) {
      console.error('Resolve error:', err)
      alert(err.message || 'Failed to resolve report')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDismiss = async (report, reason) => {
    try {
      setActionLoading(report.id)
      await dismissReport(report.id, reason)
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'dismissed' } : r))
      closeModal()
    } catch (err) {
      console.error('Dismiss error:', err)
      alert(err.message || 'Failed to dismiss report')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReopen = async (report) => {
    try {
      setActionLoading(report.id)
      await reopenReport(report.id)
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'pending' } : r))
    } catch (err) {
      console.error('Reopen error:', err)
      alert(err.message || 'Failed to reopen report')
    } finally {
      setActionLoading(null)
    }
  }

  const openResolveModal = (report) => {
    setSelectedReport(report)
    setModalAction('resolve')
    setModalResolution('')
    setShowModal(true)
  }

  const openDismissModal = (report) => {
    setSelectedReport(report)
    setModalAction('dismiss')
    setModalResolution('')
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedReport(null)
    setModalAction('')
    setModalResolution('')
    setShowModal(false)
  }

  const handleModalSubmit = () => {
    if (!modalResolution.trim()) {
      alert('Please provide details')
      return
    }
    if (modalAction === 'resolve') {
      handleResolve(selectedReport, modalResolution)
    } else if (modalAction === 'dismiss') {
      handleDismiss(selectedReport, modalResolution)
    }
  }

  const columns = [
    {
      key: 'reportedBy',
      title: 'Reported By',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-dark dark:text-light">{value}</span>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          value === 'listing' ? 'bg-primary/10 text-primary' :
          value === 'user' ? 'bg-success/10 text-success' :
          'bg-warning/10 text-warning'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'subject',
      title: 'Subject',
      render: (value) => (
        <span className="text-dark dark:text-light">{value}</span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <span className="line-clamp-2 text-muted dark:text-dark-muted" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'reportedItem',
      title: 'Reported Item',
      render: (value) => (
        <span className="text-sm text-muted dark:text-dark-muted truncate max-w-[150px] block">
          {value}
        </span>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted dark:text-dark-muted">{value}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light hover:bg-foreground dark:hover:bg-dark-background rounded transition-colors"
            title="View Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => openResolveModal(row)}
                disabled={actionLoading === row.id}
                className="p-1.5 text-muted dark:text-dark-muted hover:text-success hover:bg-success/10 rounded transition-colors disabled:opacity-50"
                title="Resolve"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => openDismissModal(row)}
                disabled={actionLoading === row.id}
                className="p-1.5 text-muted dark:text-dark-muted hover:text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          {(row.status === 'resolved' || row.status === 'dismissed') && (
            <button
              onClick={() => handleReopen(row)}
              disabled={actionLoading === row.id}
              className="p-1.5 text-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
              title="Reopen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      value: filters.type,
      options: [
        { value: 'listing', label: 'Listing' },
        { value: 'user', label: 'User' },
        { value: 'booking', label: 'Booking' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      value: filters.status,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Reports Management</h1>
          <p className="text-muted dark:text-dark-muted mt-1">Handle complaints, flagged content, and user reports.</p>
        </div>
        <LoadingState count={5} type="card" />
      </div>
    )
  }

  if (error && reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Reports Management</h1>
        </div>
        <ErrorState onRetry={fetchReports} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-light">Reports Management</h1>
        <p className="text-muted dark:text-dark-muted mt-1">Handle complaints, flagged content, and user reports.</p>
      </div>

      {/* Search and Filters */}
      <div className="card dark:bg-dark-foreground space-y-4">
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Search reports..."
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
              <option value="">All {filter.label}s</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      {reports.length > 0 ? (
        <div className="card dark:bg-dark-foreground overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground dark:bg-dark-background border-b border-border dark:border-dark-border">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-dark-border">
                {reports.map((row) => (
                  <tr key={row.id} className="hover:bg-foreground dark:hover:bg-dark-background transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card dark:bg-dark-foreground text-center py-12">
          <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          <p className="text-dark dark:text-light font-medium">No reports found</p>
          <p className="text-muted dark:text-dark-muted text-sm mt-1">All reports will appear here</p>
        </div>
      )}

      {/* Pagination */}
      {reports.length > 0 && (
        <div className="card dark:bg-dark-foreground flex items-center justify-between">
          <div className="text-sm text-muted dark:text-dark-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
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

      {/* Modal for View/Resolve/Dismiss */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-foreground rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {modalAction === 'view' ? (
              <>
                <div className="p-6 border-b border-border dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark dark:text-light">Report Details</h3>
                    <button
                      onClick={closeModal}
                      className="p-1 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Reported By</p>
                    <p className="text-dark dark:text-light mt-1">{selectedReport.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Type</p>
                    <p className="text-dark dark:text-light mt-1 capitalize">{selectedReport.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Subject</p>
                    <p className="text-dark dark:text-light mt-1">{selectedReport.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Description</p>
                    <p className="text-dark dark:text-light mt-1">{selectedReport.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Reported Item</p>
                    <p className="text-dark dark:text-light mt-1">{selectedReport.reportedItem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Date</p>
                    <p className="text-dark dark:text-light mt-1">{selectedReport.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Status</p>
                    <StatusBadge status={selectedReport.status} />
                  </div>
                  {selectedReport.resolution && (
                    <div>
                      <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase">Resolution</p>
                      <p className="text-dark dark:text-light mt-1">{selectedReport.resolution}</p>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-border dark:border-dark-border flex gap-2">
                  {selectedReport.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setModalAction('resolve')
                          setModalResolution('')
                        }}
                        className="flex-1 py-2 px-3 bg-success text-white text-sm font-medium rounded-lg hover:bg-success-hover transition-colors"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => {
                          setModalAction('dismiss')
                          setModalResolution('')
                        }}
                        className="flex-1 py-2 px-3 border border-border dark:border-dark-border text-muted dark:text-dark-muted text-sm font-medium rounded-lg hover:bg-error/10 hover:text-error hover:border-error transition-colors"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  <button
                    onClick={closeModal}
                    className="py-2 px-3 border border-border dark:border-dark-border text-muted dark:text-dark-muted text-sm font-medium rounded-lg hover:bg-foreground dark:hover:bg-dark-background transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-border dark:border-dark-border">
                  <h3 className="text-lg font-semibold text-dark dark:text-light">
                    {modalAction === 'resolve' ? 'Resolve Report' : 'Dismiss Report'}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted dark:text-dark-muted mb-4">
                    {modalAction === 'resolve'
                      ? 'Please provide details on how this report was resolved.'
                      : 'Please provide a reason for dismissing this report.'}
                  </p>
                  <textarea
                    value={modalResolution}
                    onChange={(e) => setModalResolution(e.target.value)}
                    placeholder={modalAction === 'resolve' ? 'Resolution details...' : 'Dismissal reason...'}
                    className="input-field text-sm min-h-[100px] resize-none"
                    autoFocus
                  />
                </div>
                <div className="p-6 border-t border-border dark:border-dark-border flex gap-2">
                  <button
                    onClick={() => setModalAction('view')}
                    className="py-2 px-3 border border-border dark:border-dark-border text-muted dark:text-dark-muted text-sm font-medium rounded-lg hover:bg-foreground dark:hover:bg-dark-background transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleModalSubmit}
                    disabled={actionLoading === selectedReport.id || !modalResolution.trim()}
                    className={`flex-1 py-2 px-3 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${
                      modalAction === 'resolve'
                        ? 'bg-success hover:bg-success-hover'
                        : 'bg-error hover:bg-error-hover'
                    }`}
                  >
                    {actionLoading === selectedReport.id ? 'Processing...' : modalAction === 'resolve' ? 'Resolve' : 'Dismiss'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
