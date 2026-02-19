// Admin Settings Module
// Platform settings, admin account settings, and notification preferences
// API-ready with loading, error, and success states

import { useState, useEffect } from 'react'
import {
  getAdminSettings,
  updateAdminSettings,
  getPlatformSettings,
  updatePlatformSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  changeAdminPassword
} from '../../api/adminSettings'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    name: '',
    email: '',
  })

  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    autoApproveListings: false,
    maxListingsPerLandlord: 50,
    maxImagesPerListing: 10,
  })

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    newReportAlerts: true,
    newUserAlerts: true,
    listingReviewAlerts: true,
    bookingAlerts: true,
    verificationAlerts: true,
  })

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswordSection, setShowPasswordSection] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const [accountRes, platformRes, notificationRes] = await Promise.all([
        getAdminSettings().catch(() => ({ settings: accountSettings })),
        getPlatformSettings().catch(() => ({ settings: platformSettings })),
        getNotificationPreferences().catch(() => ({ preferences: notificationPreferences })),
      ])

      if (accountRes.settings) {
        setAccountSettings(accountRes.settings)
      }
      if (platformRes.settings) {
        setPlatformSettings(platformRes.settings)
      }
      if (notificationRes.preferences) {
        setNotificationPreferences(notificationRes.preferences)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch settings')
      console.error('Settings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAccount = async () => {
    try {
      setSaving(true)
      setSuccess(null)
      setError(null)
      await updateAdminSettings(accountSettings)
      setSuccess('Account settings saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save account settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePlatform = async () => {
    try {
      setSaving(true)
      setSuccess(null)
      setError(null)
      await updatePlatformSettings(platformSettings)
      setSuccess('Platform settings saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save platform settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      setSuccess(null)
      setError(null)
      await updateNotificationPreferences(notificationPreferences)
      setSuccess('Notification preferences saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      setSaving(true)
      setSuccess(null)
      setError(null)
      await changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setSuccess('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSection(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'platform', label: 'Platform' },
    { id: 'notifications', label: 'Notifications' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Settings</h1>
          <p className="text-muted dark:text-dark-muted mt-1">Manage your admin account and platform settings.</p>
        </div>
        <LoadingState count={3} type="card" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-light">Settings</h1>
        <p className="text-muted dark:text-dark-muted mt-1">Manage your admin account and platform settings.</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-error hover:text-error-hover">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border dark:border-dark-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Account Settings Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="card dark:bg-dark-foreground">
            <h2 className="text-lg font-semibold text-dark dark:text-light mb-6">Account Settings</h2>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Full Name</label>
                <input
                  type="text"
                  value={accountSettings.name}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Admin User"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Email Address</label>
                <input
                  type="email"
                  value={accountSettings.email}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="admin@kejani.com"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="card dark:bg-dark-foreground">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark dark:text-light">Password</h2>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-sm text-primary hover:text-primary-hover"
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordSection && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-light mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-light mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-light mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="btn-primary"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {!showPasswordSection && (
              <p className="text-sm text-muted dark:text-dark-muted">
                Password last changed: Never (demo account)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Platform Settings Tab */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div className="card dark:bg-dark-foreground">
            <h2 className="text-lg font-semibold text-dark dark:text-light mb-6">Platform Settings</h2>
            <div className="space-y-6 max-w-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.maintenanceMode}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-dark dark:text-light">Maintenance Mode</span>
                  <p className="text-xs text-muted dark:text-dark-muted">When enabled, only admins can access the platform</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.userRegistration}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, userRegistration: e.target.checked }))}
                  className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-dark dark:text-light">Allow User Registration</span>
                  <p className="text-xs text-muted dark:text-dark-muted">New users can create accounts on the platform</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.autoApproveListings}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, autoApproveListings: e.target.checked }))}
                  className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-dark dark:text-light">Auto-Approve Listings</span>
                  <p className="text-xs text-muted dark:text-dark-muted">Listings are automatically approved without review</p>
                </div>
              </label>

              <hr className="border-border dark:border-dark-border" />

              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Max Listings Per Landlord</label>
                <input
                  type="number"
                  value={platformSettings.maxListingsPerLandlord}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxListingsPerLandlord: parseInt(e.target.value) || 50 }))}
                  className="input-field"
                  min="1"
                  max="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Max Images Per Listing</label>
                <input
                  type="number"
                  value={platformSettings.maxImagesPerListing}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxImagesPerListing: parseInt(e.target.value) || 10 }))}
                  className="input-field"
                  min="1"
                  max="20"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSavePlatform}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card dark:bg-dark-foreground border-error/20">
            <h2 className="text-lg font-semibold text-error mb-4">Danger Zone</h2>
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 bg-error/5 rounded-lg">
                <div>
                  <p className="font-medium text-dark dark:text-light">Clear All Cache</p>
                  <p className="text-xs text-muted dark:text-dark-muted">Clear all cached data on the platform</p>
                </div>
                <button className="px-3 py-2 border border-error text-error text-sm font-medium rounded-lg hover:bg-error hover:text-white transition-colors">
                  Clear Cache
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-error/5 rounded-lg">
                <div>
                  <p className="font-medium text-dark dark:text-light">Reset Platform</p>
                  <p className="text-xs text-muted dark:text-dark-muted">Reset all settings to default values</p>
                </div>
                <button className="px-3 py-2 border border-error text-error text-sm font-medium rounded-lg hover:bg-error hover:text-white transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card dark:bg-dark-foreground">
          <h2 className="text-lg font-semibold text-dark dark:text-light mb-6">Notification Preferences</h2>
          <div className="space-y-6 max-w-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.emailNotifications}
                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-dark dark:text-light">Enable Email Notifications</span>
                <p className="text-xs text-muted dark:text-dark-muted">Receive notifications via email</p>
              </div>
            </label>

            <hr className="border-border dark:border-dark-border" />

            <h3 className="font-medium text-dark dark:text-light">Alert Types</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.newReportAlerts}
                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, newReportAlerts: e.target.checked }))}
                className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-dark dark:text-light">New Reports</span>
                <p className="text-xs text-muted dark:text-dark-muted">Get notified when a new report is submitted</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.newUserAlerts}
                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, newUserAlerts: e.target.checked }))}
                className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-dark dark:text-light">New User Registrations</span>
                <p className="text-xs text-muted dark:text-dark-muted">Get notified when a new user registers</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.listingReviewAlerts}
                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, listingReviewAlerts: e.target.checked }))}
                className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-dark dark:text-light">Pending Listing Reviews</span>
                <p className="text-xs text-muted dark:text-dark-muted">Get notified when listings need review</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.bookingAlerts}
                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, bookingAlerts: e.target.checked }))}
                className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-dark dark:text-light">Booking Alerts</span>
                <p className="text-xs text-muted dark:text-dark-muted">Get notified about booking activities</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.verificationAlerts}
                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, verificationAlerts: e.target.checked }))}
                className="w-5 h-5 rounded border-border dark:border-dark-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-dark dark:text-light">Verification Requests</span>
                <p className="text-xs text-muted dark:text-dark-muted">Get notified about new verification requests</p>
              </div>
            </label>

            <div className="pt-4">
              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
