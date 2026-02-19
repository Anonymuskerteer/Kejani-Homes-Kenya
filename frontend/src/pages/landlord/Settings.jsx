import { useState, useEffect } from 'react'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('mpesa')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    mpesa: {
      name: '',
      phoneNumber: '',
    },
    paybill: {
      paybillNumber: '',
      accountNumber: '',
    },
    bank: {
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data for demo
      const mockSettings = {
        mpesa: {
          name: 'John Property Solutions',
          phoneNumber: '+254712345678',
        },
        paybill: {
          paybillNumber: '500100',
          accountNumber: 'PROPERTY001',
        },
        bank: {
          bankName: 'Kenya Commercial Bank',
          accountName: 'Property Solutions Ltd',
          accountNumber: '1234567890123',
        },
      }

      setFormData(mockSettings)
    } catch (err) {
      setError(err.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e, section) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }))
  }

  const handleSaveSettings = async (section) => {
    try {
      console.log(`Saving ${section} settings:`, formData[section])
      setIsEditing(false)
      // API call would go here
    } catch (err) {
      console.error(`Failed to save ${section} settings:`, err)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState onRetry={fetchSettings} />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Financial Settings</h1>
        <p className="text-text-secondary mt-1">Configure payment details for tenant payments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { id: 'mpesa', label: 'M-PESA Details' },
          { id: 'paybill', label: 'Paybill Details' },
          { id: 'bank', label: 'Bank Details' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setIsEditing(false)
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* M-PESA Details Tab */}
      {activeTab === 'mpesa' && (
        <div className="card space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">M-PESA Details</h2>
              <p className="text-sm text-text-secondary mt-1">
                Add your M-PESA paybill or business account details
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="button-secondary px-3 py-1 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  M-PESA Name (As displayed)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.mpesa.name}
                  onChange={(e) => handleInputChange(e, 'mpesa')}
                  placeholder="Enter M-PESA account name"
                  className="input-field"
                />
                <p className="text-xs text-text-secondary mt-1">
                  This is the name that will appear to tenants
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  M-PESA Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.mpesa.phoneNumber}
                  onChange={(e) => handleInputChange(e, 'mpesa')}
                  placeholder="+254712345678"
                  className="input-field"
                />
                <p className="text-xs text-text-secondary mt-1">
                  The phone number linked to your M-PESA account
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSaveSettings('mpesa')}
                  className="button-primary flex-1"
                >
                  Save Details
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Name</p>
                  <p className="text-text-primary mt-1">{formData.mpesa.name || 'Not set'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Phone Number</p>
                <p className="text-text-primary mt-1">{formData.mpesa.phoneNumber || 'Not set'}</p>
              </div>
              {formData.mpesa.name && (
                <div className="p-3 bg-success bg-opacity-10 border border-success rounded-card">
                  <p className="text-sm text-success font-medium">✓ M-PESA details configured</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Paybill Details Tab */}
      {activeTab === 'paybill' && (
        <div className="card space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Paybill Details</h2>
              <p className="text-sm text-text-secondary mt-1">
                Add your Safaricom Paybill account details
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="button-secondary px-3 py-1 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Paybill Number
                </label>
                <input
                  type="text"
                  name="paybillNumber"
                  value={formData.paybill.paybillNumber}
                  onChange={(e) => handleInputChange(e, 'paybill')}
                  placeholder="500100"
                  maxLength="6"
                  className="input-field"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Your 6-digit Safaricom Paybill number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.paybill.accountNumber}
                  onChange={(e) => handleInputChange(e, 'paybill')}
                  placeholder="PROPERTY001"
                  className="input-field"
                />
                <p className="text-xs text-text-secondary mt-1">
                  The account number or reference for your paybill
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSaveSettings('paybill')}
                  className="button-primary flex-1"
                >
                  Save Details
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Paybill Number</p>
                <p className="text-text-primary mt-1 font-mono">{formData.paybill.paybillNumber || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Account Number</p>
                <p className="text-text-primary mt-1 font-mono">{formData.paybill.accountNumber || 'Not set'}</p>
              </div>
              {formData.paybill.paybillNumber && (
                <div className="p-3 bg-success bg-opacity-10 border border-success rounded-card">
                  <p className="text-sm text-success font-medium">✓ Paybill details configured</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bank Details Tab */}
      {activeTab === 'bank' && (
        <div className="card space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Bank Details</h2>
              <p className="text-sm text-text-secondary mt-1">
                Add your bank account details for direct transfers
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="button-secondary px-3 py-1 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bank Name
                </label>
                <select
                  name="bankName"
                  value={formData.bank.bankName}
                  onChange={(e) => handleInputChange(e, 'bank')}
                  className="input-field"
                >
                  <option value="">Select a bank</option>
                  <option value="Kenya Commercial Bank">Kenya Commercial Bank</option>
                  <option value="Equity Bank">Equity Bank</option>
                  <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                  <option value="Barclays Bank">Barclays Bank</option>
                  <option value="Co-operative Bank">Co-operative Bank</option>
                  <option value="NCBA">NCBA</option>
                  <option value="DTB">DTB</option>
                  <option value="I&M Bank">I&M Bank</option>
                  <option value="ABC Bank">ABC Bank</option>
                  <option value="Family Bank">Family Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.bank.accountName}
                  onChange={(e) => handleInputChange(e, 'bank')}
                  placeholder="John Property Solutions Ltd"
                  className="input-field"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Account holder name as it appears on bank statements
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.bank.accountNumber}
                  onChange={(e) => handleInputChange(e, 'bank')}
                  placeholder="1234567890123"
                  className="input-field"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Your bank account number
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSaveSettings('bank')}
                  className="button-primary flex-1"
                >
                  Save Details
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Bank Name</p>
                <p className="text-text-primary mt-1">{formData.bank.bankName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Account Name</p>
                <p className="text-text-primary mt-1">{formData.bank.accountName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Account Number</p>
                <p className="text-text-primary mt-1 font-mono">{formData.bank.accountNumber || 'Not set'}</p>
              </div>
              {formData.bank.bankName && (
                <div className="p-3 bg-success bg-opacity-10 border border-success rounded-card">
                  <p className="text-sm text-success font-medium">✓ Bank details configured</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">Payment Integration Coming Soon</h4>
            <p className="text-blue-800 text-sm mt-1">
              Your financial details are securely stored and will be used for automated payment processing when integrated with M-PESA, Paybill, and Bank Transfer APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
