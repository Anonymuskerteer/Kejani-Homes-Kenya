// Verification Module
// Verify agencies and landlords with certificate preview
// API-ready with loading, error, and empty states

import { useState, useEffect } from 'react'
import {
  getVerificationRequests,
  approveVerification,
  rejectVerification,
  requestChanges
} from '../../api/adminVerification'
import StatusBadge from '../../components/admin/StatusBadge'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function Verification() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [filters, setFilters] = useState({ type: '', status: '' })
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [modalReason, setModalReason] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [pagination.page, filters])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getVerificationRequests({
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type,
        status: filters.status,
      })
      setRequests(response.requests || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (err) {
      setError(err.message || 'Failed to fetch verification requests')
      console.error('Verification fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request) => {
    try {
      setActionLoading(request.id)
      await approveVerification(request.id)
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r))
    } catch (err) {
      console.error('Approve error:', err)
      alert(err.message || 'Failed to approve verification')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (request, reason) => {
    try {
      setActionLoading(request.id)
      await rejectVerification(request.id, reason)
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r))
      closeModal()
    } catch (err) {
      console.error('Reject error:', err)
      alert(err.message || 'Failed to reject verification')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestChanges = async (request, feedback) => {
    try {
      setActionLoading(request.id)
      await requestChanges(request.id, feedback)
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'changes_requested' } : r))
      closeModal()
    } catch (err) {
      console.error('Request changes error:', err)
      alert(err.message || 'Failed to request changes')
    } finally {
      setActionLoading(null)
    }
  }

  const openModal = (request, action) => {
    setSelectedRequest(request)
    setModalAction(action)
    setModalReason('')
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setModalAction('')
    setModalReason('')
    setShowModal(false)
  }

  const handleModalSubmit = () => {
    if (!modalReason.trim()) {
      alert('Please provide a reason')
      return
    }
    if (modalAction === 'reject') {
      handleReject(selectedRequest, modalReason)
    } else if (modalAction === 'request_changes') {
      handleRequestChanges(selectedRequest, modalReason)
    }
  }

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      value: filters.type,
      options: [
        { value: 'agency', label: 'Agencies' },
        { value: 'landlord', label: 'Landlords' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      value: filters.status,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'changes_requested', label: 'Changes Requested' },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Verification Management</h1>
          <p className="text-muted dark:text-dark-muted mt-1">Review and verify agency and landlord verification requests.</p>
        </div>
        <LoadingState count={4} type="card" />
      </div>
    )
  }

  if (error && requests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Verification Management</h1>
        </div>
        <ErrorState onRetry={fetchRequests} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-light">Verification Management</h1>
        <p className="text-muted dark:text-dark-muted mt-1">Review and verify agency and landlord verification requests.</p>
      </div>

      {/* Filters */}
      <div className="card dark:bg-dark-foreground space-y-4">
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

      {/* Verification Cards Grid */}
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="card dark:bg-dark-foreground overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    request.type === 'agency'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-success/10 text-success'
                  }`}>
                    {request.type}
                  </span>
                  <StatusBadge status={request.status} size="sm" />
                </div>
                <span className="text-xs text-muted dark:text-dark-muted">
                  {request.submittedAt || request.createdAt}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-dark dark:text-light">{request.name || request.agencyName}</h3>
                {request.type === 'agency' && (
                  <p className="text-sm text-muted dark:text-dark-muted mt-1">
                    Reg No: {request.registrationNumber}
                  </p>
                )}

                {/* Certificate Preview */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted dark:text-dark-muted mb-2">Certificate Preview</p>
                  <div className="aspect-video bg-foreground dark:bg-dark-background rounded-lg overflow-hidden">
                    {request.certificate || request.documentUrl ? (
                      <img
                        src={request.certificate || request.documentUrl}
                        alt="Certificate"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full hidden items-center justify-center bg-foreground dark:bg-dark-background">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xs text-muted dark:text-dark-muted mt-2">No preview available</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {request.documents && request.documents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted dark:text-dark-muted mb-2">Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {request.documents.map((doc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-foreground dark:bg-dark-background text-muted dark:text-dark-muted text-xs rounded"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border dark:border-dark-border">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={actionLoading === request.id}
                      className="flex-1 py-2 px-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(request, 'reject')}
                      disabled={actionLoading === request.id}
                      className="flex-1 py-2 px-3 border border-border dark:border-dark-border text-muted dark:text-dark-muted text-sm font-medium rounded-lg hover:bg-error/10 hover:text-error hover:border-error disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openModal(request, 'request_changes')}
                      disabled={actionLoading === request.id}
                      className="px-3 py-2 border border-border dark:border-dark-border text-muted dark:text-dark-muted text-sm font-medium rounded-lg hover:bg-warning/10 hover:text-warning hover:border-warning disabled:opacity-50 transition-colors"
                    >
                      Request Changes
                    </button>
                  </div>
                )}

                {/* Status Info for Non-Pending */}
                {request.status !== 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border dark:border-dark-border">
                    <p className="text-sm text-muted dark:text-dark-muted">
                      Status: <StatusBadge status={request.status} size="sm" />
                    </p>
                    {request.reviewedAt && (
                      <p className="text-xs text-muted dark:text-dark-muted mt-1">
                        Reviewed on: {request.reviewedAt}
                      </p>
                    )}
                    {request.reviewNote && (
                      <p className="text-xs text-muted dark:text-dark-muted mt-1">
                        Note: {request.reviewNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card dark:bg-dark-foreground text-center py-12">
          <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-dark dark:text-light font-medium">No verification requests found</p>
          <p className="text-muted dark:text-dark-muted text-sm mt-1">All verification requests will appear here</p>
        </div>
      )}

      {/* Pagination */}
      {requests.length > 0 && (
        <div className="card dark:bg-dark-foreground flex items-center justify-between">
          <div className="text-sm text-muted dark:text-dark-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
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

      {/* Modal for Reject/Request Changes */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-foreground rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">
              {modalAction === 'reject' ? 'Reject Verification' : 'Request Changes'}
            </h3>
            <p className="text-sm text-muted dark:text-dark-muted mb-4">
              {modalAction === 'reject'
                ? 'Please provide a reason for rejecting this verification request.'
                : 'Please provide details on what changes are needed.'}
            </p>
            <textarea
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder={modalAction === 'reject' ? 'Rejection reason...' : 'Changes needed...'}
              className="input-field text-sm min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={closeModal}
                className="flex-1 py-2 px-3 border border-border dark:border-dark-border text-muted dark:text-dark-muted text-sm font-medium rounded-lg hover:bg-foreground dark:hover:bg-dark-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={actionLoading === selectedRequest?.id || !modalReason.trim()}
                className={`flex-1 py-2 px-3 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${
                  modalAction === 'reject'
                    ? 'bg-error hover:bg-error-hover'
                    : 'bg-warning hover:bg-warning-hover'
                }`}
              >
                {actionLoading === selectedRequest?.id ? 'Processing...' : modalAction === 'reject' ? 'Reject' : 'Request Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
