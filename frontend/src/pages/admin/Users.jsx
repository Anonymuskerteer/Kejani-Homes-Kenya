// Users Management Module
// Table-based user management with search and filters

import { useState, useEffect } from 'react'
import { getUsers, verifyUser, suspendUser, unsuspendUser } from '../../api/adminUsers'
import AdminTable from '../../components/admin/AdminTable'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    verified: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
        verified: filters.verified,
      })
      setUsers(response.users || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
      console.error('Users fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (user) => {
    console.log('View profile:', user)
  }

  const handleVerify = async (user) => {
    try {
      await verifyUser(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verified: true } : u))
    } catch (err) {
      console.error('Verify error:', err)
    }
  }

  const handleSuspend = async (user) => {
    try {
      if (user.status === 'suspended') {
        await unsuspendUser(user.id)
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u))
      } else {
        await suspendUser(user.id)
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u))
      }
    } catch (err) {
      console.error('Suspend error:', err)
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-medium text-sm">{value?.charAt(0) || '?'}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-dark dark:text-light truncate">{value}</p>
            <p className="text-xs text-muted dark:text-dark-muted">{row.phone || 'No phone'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (value) => <p className="text-sm text-dark dark:text-light truncate">{value}</p>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}>
          {value?.charAt(0).toUpperCase() + value?.slice(1) || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'verified',
      title: 'Verified',
      render: (value) => (
        value ? (
          <span className="flex items-center gap-1 text-success">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-warning">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            No
          </span>
        )
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewProfile(row)}
            className="p-1.5 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light hover:bg-foreground dark:hover:bg-dark-background rounded transition-colors"
            title="View Profile"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleVerify(row)}
            className="p-1.5 text-muted dark:text-dark-muted hover:text-success hover:bg-success/10 rounded transition-colors"
            title={row.verified ? 'Already verified' : 'Verify'}
            disabled={row.verified}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleSuspend(row)}
            className={`p-1.5 rounded transition-colors ${
              row.status === 'suspended'
                ? 'text-muted dark:text-dark-muted hover:text-success hover:bg-success/10'
                : 'text-muted dark:text-dark-muted hover:text-error hover:bg-error/10'
            }`}
            title={row.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      value: filters.role,
      options: [
        { value: 'tenant', label: 'Tenant' },
        { value: 'landlord', label: 'Landlord' },
        { value: 'agency', label: 'Agency' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      value: filters.status,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
    {
      key: 'verified',
      label: 'Verified',
      value: filters.verified,
      options: [
        { value: 'true', label: 'Verified' },
        { value: 'false', label: 'Not Verified' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-light">Users Management</h1>
        <p className="text-muted dark:text-dark-muted mt-1">Manage all platform users including tenants, landlords, and agencies.</p>
      </div>

      {/* Search and Filters */}
      <div className="card dark:bg-dark-foreground space-y-4">
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
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

      {/* Table */}
      {loading ? (
        <LoadingState count={5} type="card" />
      ) : error ? (
        <ErrorState onRetry={fetchUsers} />
      ) : users.length > 0 ? (
        <AdminTable columns={columns} data={users} />
      ) : (
        <div className="card dark:bg-dark-foreground text-center py-12">
          <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-dark dark:text-light font-medium">No users found</p>
          <p className="text-muted dark:text-dark-muted text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {users.length > 0 && (
        <div className="card dark:bg-dark-foreground flex items-center justify-between">
          <div className="text-sm text-muted dark:text-dark-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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
