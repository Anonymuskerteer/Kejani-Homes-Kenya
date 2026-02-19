// API Management Module
// Manage API keys and third-party integrations

import { useState, useEffect } from 'react'
import {
  getApiStats,
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiKeySecret,
  toggleApiKeyStatus,
  getIntegrationTemplates,
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  toggleIntegrationStatus,
  testIntegration
} from '../../api/adminApi'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function Api() {
  const [activeTab, setActiveTab] = useState('keys')
  const [stats, setStats] = useState(null)
  const [apiKeys, setApiKeys] = useState([])
  const [integrations, setIntegrations] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: '', type: '' })
  
  // Modal states
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  
  // Form states
  const [keyForm, setKeyForm] = useState({
    name: '',
    description: '',
    permissions: ['read'],
    rateLimit: 1000,
    expiresAt: ''
  })
  
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    type: 'payment',
    provider: '',
    description: '',
    credentials: { apiKey: '', apiSecret: '', webhookSecret: '', additionalFields: {} },
    settings: { sandbox: false, autoRetry: true, timeout: 30000 },
    webhookUrl: '',
    webhookEvents: []
  })

  useEffect(() => {
    fetchStats()
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (activeTab === 'keys') {
      fetchApiKeys()
    } else {
      fetchIntegrations()
    }
  }, [activeTab, pagination.page, filters])

  const fetchStats = async () => {
    try {
      const response = await getApiStats()
      setStats(response)
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await getIntegrationTemplates()
      setTemplates(response)
    } catch (err) {
      console.error('Templates fetch error:', err)
    }
  }

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getApiKeys({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status
      })
      setApiKeys(response.apiKeys || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (err) {
      setError(err.message || 'Failed to fetch API keys')
      console.error('API keys fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getIntegrations({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        type: filters.type,
        status: filters.status
      })
      setIntegrations(response.integrations || [])
      setPagination(prev => ({ ...prev, total: response.total || 0 }))
    } catch (err) {
      setError(err.message || 'Failed to fetch integrations')
      console.error('Integrations fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // API Key handlers
  const handleCreateKey = async () => {
    try {
      setModalLoading(true)
      const response = await createApiKey(keyForm)
      setApiKeys(prev => [response.apiKey, ...prev])
      setShowKeyModal(false)
      setKeyForm({
        name: '',
        description: '',
        permissions: ['read'],
        rateLimit: 1000,
        expiresAt: ''
      })
      fetchStats()
      alert(`API Key created!\n\nKey: ${response.apiKey.key}\nSecret: ${response.apiKey.secret}\n\nPlease save these credentials securely. The secret will not be shown again.`)
    } catch (err) {
      alert(err.message || 'Failed to create API key')
    } finally {
      setModalLoading(false)
    }
  }

  const handleToggleKeyStatus = async (keyId) => {
    try {
      await toggleApiKeyStatus(keyId)
      setApiKeys(prev => prev.map(key => 
        key._id === keyId ? { ...key, isActive: !key.isActive } : key
      ))
      fetchStats()
    } catch (err) {
      alert(err.message || 'Failed to toggle key status')
    }
  }

  const handleRegenerateSecret = async (keyId) => {
    if (!confirm('Are you sure you want to regenerate the secret? The old secret will stop working immediately.')) return
    
    try {
      const response = await regenerateApiKeySecret(keyId)
      alert(`New secret generated: ${response.secret}\n\nPlease save this securely. It will not be shown again.`)
      fetchApiKeys()
    } catch (err) {
      alert(err.message || 'Failed to regenerate secret')
    }
  }

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return
    
    try {
      await deleteApiKey(keyId)
      setApiKeys(prev => prev.filter(key => key._id !== keyId))
      fetchStats()
    } catch (err) {
      alert(err.message || 'Failed to delete API key')
    }
  }

  // Integration handlers
  const handleInstallIntegration = (template) => {
    setIntegrationForm({
      name: template.name,
      type: template.type,
      provider: template.provider,
      description: template.description,
      credentials: {
        apiKey: '',
        apiSecret: '',
        webhookSecret: '',
        additionalFields: template.credentials.additionalFields ? 
          Object.keys(template.credentials.additionalFields).reduce((acc, key) => {
            acc[key] = ''
            return acc
          }, {}) : {}
      },
      settings: template.settings || { sandbox: false, autoRetry: true, timeout: 30000 },
      webhookUrl: '',
      webhookEvents: []
    })
    setSelectedItem(template)
    setShowInstallModal(true)
  }

  const handleCreateIntegration = async () => {
    try {
      setModalLoading(true)
      const response = await createIntegration(integrationForm)
      setIntegrations(prev => [response.integration, ...prev])
      setShowInstallModal(false)
      setShowIntegrationModal(false)
      fetchStats()
      alert('Integration installed successfully!')
    } catch (err) {
      alert(err.message || 'Failed to create integration')
    } finally {
      setModalLoading(false)
    }
  }

  const handleToggleIntegrationStatus = async (integrationId) => {
    try {
      await toggleIntegrationStatus(integrationId)
      setIntegrations(prev => prev.map(integration => 
        integration._id === integrationId ? { ...integration, isActive: !integration.isActive } : integration
      ))
      fetchStats()
    } catch (err) {
      alert(err.message || 'Failed to toggle integration status')
    }
  }

  const handleTestIntegration = async (integrationId) => {
    try {
      const response = await testIntegration(integrationId)
      if (response.success) {
        alert(`Connection test successful!\nResponse time: ${response.responseTime}ms`)
      } else {
        alert('Connection test failed. Please check your credentials.')
      }
    } catch (err) {
      alert(err.message || 'Connection test failed')
    }
  }

  const handleDeleteIntegration = async (integrationId) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) return
    
    try {
      await deleteIntegration(integrationId)
      setIntegrations(prev => prev.filter(integration => integration._id !== integrationId))
      fetchStats()
    } catch (err) {
      alert(err.message || 'Failed to delete integration')
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'sms':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'storage':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
      case 'analytics':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'maps':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">API Management</h1>
          <p className="text-sm sm:text-base text-muted dark:text-dark-muted mt-1">Manage API keys and third-party integrations.</p>
        </div>
        <button
          onClick={() => activeTab === 'keys' ? setShowKeyModal(true) : setShowInstallModal(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {activeTab === 'keys' ? 'New API Key' : 'Install Integration'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card dark:bg-dark-foreground p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.678L12 18l-1.257-2.322A6 6 0 0112 6a6 6 0 018 6z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-dark dark:text-light">{stats.apiKeys.total}</p>
                <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">Total API Keys</p>
              </div>
            </div>
          </div>
          
          <div className="card dark:bg-dark-foreground p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-dark dark:text-light">{stats.apiKeys.active}</p>
                <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">Active Keys</p>
              </div>
            </div>
          </div>
          
          <div className="card dark:bg-dark-foreground p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-dark dark:text-light">{stats.integrations.total}</p>
                <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">Integrations</p>
              </div>
            </div>
          </div>
          
          <div className="card dark:bg-dark-foreground p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-dark dark:text-light">{stats.apiKeys.totalUsage.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">Total API Calls</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card dark:bg-dark-foreground overflow-hidden">
        <div className="flex border-b border-border dark:border-dark-border overflow-x-auto">
          <button
            onClick={() => { setActiveTab('keys'); setPagination(prev => ({ ...prev, page: 1 })); }}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'keys'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => { setActiveTab('integrations'); setPagination(prev => ({ ...prev, page: 1 })); }}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'integrations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light'
            }`}
          >
            Integrations
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-3 sm:p-4 border-b border-border dark:border-dark-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder={activeTab === 'keys' ? 'Search API keys...' : 'Search integrations...'}
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }))
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="input-field text-sm"
            />
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, status: e.target.value }))
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="input-field text-sm px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {activeTab === 'integrations' && (
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, type: e.target.value }))
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="input-field text-sm px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="payment">Payment</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="storage">Storage</option>
                <option value="analytics">Analytics</option>
                <option value="maps">Maps</option>
                <option value="auth">Auth</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <LoadingState count={5} type="card" />
          ) : error ? (
            <ErrorState onRetry={activeTab === 'keys' ? fetchApiKeys : fetchIntegrations} />
          ) : activeTab === 'keys' ? (
            // API Keys Table
            apiKeys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border dark:border-dark-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted dark:text-dark-muted">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted dark:text-dark-muted">Key</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted dark:text-dark-muted">Permissions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted dark:text-dark-muted">Usage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted dark:text-dark-muted">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted dark:text-dark-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key._id} className="border-b border-border dark:border-dark-border hover:bg-foreground dark:hover:bg-dark-background">
                        <td className="py-3 px-4">
                          <p className="font-medium text-dark dark:text-light">{key.name}</p>
                          <p className="text-xs text-muted dark:text-dark-muted">{key.description || 'No description'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-foreground dark:bg-dark-background px-2 py-1 rounded">{key.key}</code>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {key.permissions?.map(perm => (
                              <span key={perm} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-dark dark:text-light">{key.usageCount?.toLocaleString() || 0}</p>
                          <p className="text-xs text-muted dark:text-dark-muted">
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never used'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            key.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                          }`}>
                            {key.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleKeyStatus(key._id)}
                              className={`p-1.5 rounded transition-colors ${
                                key.isActive
                                  ? 'text-muted dark:text-dark-muted hover:text-error hover:bg-error/10'
                                  : 'text-muted dark:text-dark-muted hover:text-success hover:bg-success/10'
                              }`}
                              title={key.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRegenerateSecret(key._id)}
                              className="p-1.5 text-muted dark:text-dark-muted hover:text-warning hover:bg-warning/10 rounded transition-colors"
                              title="Regenerate Secret"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteKey(key._id)}
                              className="p-1.5 text-muted dark:text-dark-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.678L12 18l-1.257-2.322A6 6 0 0112 6a6 6 0 018 6z" />
                </svg>
                <p className="text-dark dark:text-light font-medium">No API keys found</p>
                <p className="text-muted dark:text-dark-muted text-sm mt-1">Create your first API key to get started</p>
              </div>
            )
          ) : (
            // Integrations Grid
            integrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <div key={integration._id} className="border border-border dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          integration.isActive ? 'bg-success/10' : 'bg-muted/10'
                        }`}>
                          {getTypeIcon(integration.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-dark dark:text-light">{integration.name}</h3>
                          <p className="text-xs text-muted dark:text-dark-muted capitalize">{integration.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        integration.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        {integration.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted dark:text-dark-muted mb-3 line-clamp-2">
                      {integration.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted dark:text-dark-muted mb-3">
                      <span>{integration.usageStats?.totalRequests?.toLocaleString() || 0} requests</span>
                      <span>{integration.provider}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestIntegration(integration._id)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleToggleIntegrationStatus(integration._id)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          integration.isActive
                            ? 'text-error bg-error/10 hover:bg-error/20'
                            : 'text-success bg-success/10 hover:bg-success/20'
                        }`}
                      >
                        {integration.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration._id)}
                        className="px-3 py-1.5 text-xs font-medium text-error bg-error/10 rounded hover:bg-error/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-muted dark:text-dark-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                <p className="text-dark dark:text-light font-medium">No integrations found</p>
                <p className="text-muted dark:text-dark-muted text-sm mt-1">Install your first integration to get started</p>
              </div>
            )
          )}
        </div>

        {/* Pagination */}
        {(apiKeys.length > 0 || integrations.length > 0) && (
          <div className="p-4 border-t border-border dark:border-dark-border flex items-center justify-between">
            <div className="text-sm text-muted dark:text-dark-muted">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} {activeTab === 'keys' ? 'keys' : 'integrations'}
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

      {/* Create API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-foreground rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-lg font-bold text-dark dark:text-light">Create New API Key</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Name *</label>
                <input
                  type="text"
                  value={keyForm.name}
                  onChange={(e) => setKeyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production API Key"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Description</label>
                <textarea
                  value={keyForm.description}
                  onChange={(e) => setKeyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this key used for?"
                  rows={2}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'delete', 'admin'].map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keyForm.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setKeyForm(prev => ({ ...prev, permissions: [...prev.permissions, perm] }))
                          } else {
                            setKeyForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }))
                          }
                        }}
                        className="rounded border-border dark:border-dark-border"
                      />
                      <span className="text-sm text-dark dark:text-light capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  value={keyForm.rateLimit}
                  onChange={(e) => setKeyForm(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 1000 }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={keyForm.expiresAt}
                  onChange={(e) => setKeyForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border dark:border-dark-border flex justify-end gap-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-sm font-medium text-dark dark:text-light bg-foreground dark:bg-dark-background rounded hover:bg-border dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={!keyForm.name || modalLoading}
                className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {modalLoading ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Integration Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-foreground rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border dark:border-dark-border">
              <h2 className="text-lg font-bold text-dark dark:text-light">Install Integration</h2>
            </div>
            <div className="p-6">
              {!selectedItem ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.provider}
                      onClick={() => handleInstallIntegration(template)}
                      className="border border-border dark:border-dark-border rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(template.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-dark dark:text-light">{template.name}</h3>
                          <p className="text-xs text-muted dark:text-dark-muted capitalize">{template.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted dark:text-dark-muted line-clamp-2">{template.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex items-center gap-2 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to templates
                  </button>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(selectedItem.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-dark dark:text-light">{selectedItem.name}</h3>
                      <p className="text-sm text-muted dark:text-dark-muted">{selectedItem.description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                      {selectedItem.credentials?.apiKey?.label || 'API Key'} *
                    </label>
                    <input
                      type="text"
                      value={integrationForm.credentials.apiKey}
                      onChange={(e) => setIntegrationForm(prev => ({
                        ...prev,
                        credentials: { ...prev.credentials, apiKey: e.target.value }
                      }))}
                      placeholder={`Enter your ${selectedItem.credentials?.apiKey?.label || 'API Key'}`}
                      className="input-field w-full"
                    />
                  </div>
                  
                  {selectedItem.credentials?.apiSecret && (
                    <div>
                      <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                        {selectedItem.credentials.apiSecret.label}
                      </label>
                      <input
                        type="password"
                        value={integrationForm.credentials.apiSecret}
                        onChange={(e) => setIntegrationForm(prev => ({
                          ...prev,
                          credentials: { ...prev.credentials, apiSecret: e.target.value }
                        }))}
                        placeholder={`Enter your ${selectedItem.credentials.apiSecret.label}`}
                        className="input-field w-full"
                      />
                    </div>
                  )}
                  
                  {selectedItem.credentials?.additionalFields && Object.entries(selectedItem.credentials.additionalFields).map(([key, field]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                        {field.label} {field.required && '*'}
                      </label>
                      <input
                        type="text"
                        value={integrationForm.credentials.additionalFields?.[key] || ''}
                        onChange={(e) => setIntegrationForm(prev => ({
                          ...prev,
                          credentials: {
                            ...prev.credentials,
                            additionalFields: { ...prev.credentials.additionalFields, [key]: e.target.value }
                          }
                        }))}
                        placeholder={`Enter ${field.label}`}
                        className="input-field w-full"
                      />
                    </div>
                  ))}
                  
                  {selectedItem.settings?.sandbox !== undefined && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrationForm.settings.sandbox}
                        onChange={(e) => setIntegrationForm(prev => ({
                          ...prev,
                          settings: { ...prev.settings, sandbox: e.target.checked }
                        }))}
                        className="rounded border-border dark:border-dark-border"
                      />
                      <span className="text-sm text-dark dark:text-light">Use Sandbox Environment</span>
                    </label>
                  )}
                </div>
              )}
            </div>
            {selectedItem && (
              <div className="p-6 border-t border-border dark:border-dark-border flex justify-end gap-3">
                <button
                  onClick={() => { setShowInstallModal(false); setSelectedItem(null); }}
                  className="px-4 py-2 text-sm font-medium text-dark dark:text-light bg-foreground dark:bg-dark-background rounded hover:bg-border dark:hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIntegration}
                  disabled={!integrationForm.credentials.apiKey || modalLoading}
                  className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {modalLoading ? 'Installing...' : 'Install Integration'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}