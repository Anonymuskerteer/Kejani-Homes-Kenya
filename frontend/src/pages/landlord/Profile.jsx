import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { getCurrentUser, updateProfile, uploadProfileImage, logout } from '../../api/users'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState(null)
  const [agencyLogo, setAgencyLogo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [photoStatus, setPhotoStatus] = useState('none') // none, pending, approved, rejected
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getCurrentUser()
      const userData = response.user
      const stats = response.stats || {}
      
      // Determine if user is an agency or landlord
      const isAgency = userData.role === 'agency'
      
      // Transform the API response to match the component's expected format
      const formattedUser = {
        id: userData._id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        name: isAgency ? userData.agencyName : `${userData.firstName} ${userData.lastName}`,
        email: isAgency ? (userData.landlordEmail || userData.email) : userData.email,
        phone: isAgency ? (userData.landlordPhone || userData.tenantPhone || '') : (userData.tenantPhone || ''),
        county: isAgency ? userData.landlordCounty : userData.tenantCounty,
        accountType: userData.role, // 'landlord' or 'agency'
        agencyName: userData.agencyName || '',
        agencyRegistrationNumber: userData.registrationNumber || '',
        // Use landlordProfilePhoto for landlord/agency avatar with gender support
        avatar: userData.landlordProfilePhoto || userData.avatar || (userData.gender 
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}&gender=${userData.gender}`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`),
        pendingAvatar: userData.pendingProfilePhoto || null,
        logo: userData.companyLogo || `https://api.dicebear.com/7.x/shapes/svg?seed=${userData.agencyName || userData.email}`,
        gender: userData.gender || null,
        totalListings: stats.totalListings || 0,
        activeListings: stats.activeListings || 0,
        totalBookings: stats.totalBookings || 0,
        joinedDate: new Date(userData.createdAt),
      }

      setPhotoStatus(userData.profilePhotoStatus || 'none')

      setUser(formattedUser)
      setFormData(formattedUser)
    } catch (err) {
      setError(err.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setProfilePhoto(previewUrl)
      setProfilePhotoFile(file)

      // Upload to Cloudinary immediately
      try {
        setUploadingPhoto(true)
        const result = await uploadProfileImage(file)
        setPhotoStatus(result.profilePhotoStatus || 'pending')
        alert(result.message || 'Profile photo uploaded and pending admin approval')
      } catch (err) {
        console.error('Failed to upload profile photo:', err)
        alert(err.message || 'Failed to upload profile photo')
        setProfilePhoto(null)
        setProfilePhotoFile(null)
      } finally {
        setUploadingPhoto(false)
      }
    }
  }

  const handleAgencyLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAgencyLogo(e.target?.result)
        setFormData(prev => ({ ...prev, logo: e.target?.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      // Prepare update data based on account type
      // Note: profile photo is NOT included here - it's uploaded separately via upload-profile-photo
      const isAgency = formData.accountType === 'agency'
      const updateData = isAgency ? {
        agencyName: formData.agencyName,
        landlordEmail: formData.email,
        landlordPhone: formData.phone,
        landlordCounty: formData.county,
        gender: formData.gender,
      } : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tenantPhone: formData.phone,
        tenantCounty: formData.county,
        gender: formData.gender,
      }

      const response = await updateProfile(updateData)
      
      // Update local state with the response
      setUser({
        ...formData,
        ...response.user,
      })
      setIsEditing(false)
      setProfilePhoto(null)
      setAgencyLogo(null)
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState onRetry={fetchUserProfile} />
  }

  if (!user) {
    return <ErrorState title="Profile not found" />
  }

  const isAgency = user.accountType === 'agency'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card">
        <div className="flex flex-col items-center text-center gap-4">
          {isEditing ? (
            <div className="relative">
              <label className="relative cursor-pointer group">
                {uploadingPhoto && (
                  <div className="absolute inset-0 z-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
                <img
                  src={profilePhoto || user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-primary object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
              {photoStatus === 'pending' && (
                <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  ⏳ Pending admin approval
                </span>
              )}
              {photoStatus === 'rejected' && (
                <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  ❌ Photo rejected - upload a new one
                </span>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-primary object-cover"
              />
              {photoStatus === 'pending' && (
                <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  ⏳ Photo pending approval
                </span>
              )}
            </div>
          )}

          {!isEditing && (
            <div>
              <h2 className="text-2xl font-bold text-dark dark:text-light">
                {isAgency ? user.agencyName : `${user.firstName} ${user.lastName}`}
              </h2>
              <p className="text-muted dark:text-dark-muted">{isAgency ? 'Agency' : 'Landlord'}</p>
            </div>
          )}
        </div>

        {/* Account stats */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{user.totalListings}</p>
              <p className="text-muted dark:text-dark-muted text-sm">Total Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{user.activeListings}</p>
              <p className="text-muted dark:text-dark-muted text-sm">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{user.totalBookings}</p>
              <p className="text-muted dark:text-dark-muted text-sm">Bookings</p>
            </div>
          </div>
        </div>

        {/* Edit button */}
        {!isEditing && (
          <div className="mt-6 pt-6 border-t border-border flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="button-primary flex-1"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/landlord-dashboard/settings')}
              className="button-secondary flex-1"
            >
              Financial Settings
            </button>
          </div>
        )}
      </div>

      {/* General Information Section */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-dark dark:text-light">General Information</h3>

        {isEditing ? (
          <div className="space-y-4">
            {isAgency ? (
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">Agency Name</label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-light mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-light mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                className="input-field bg-gray-100 cursor-not-allowed dark:bg-gray-700"
                disabled
              />
              <p className="text-xs text-muted dark:text-dark-muted mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-2">County</label>
              <select
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select county</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Machakos">Machakos</option>
                <option value="Kajiado">Kajiado</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-2">Gender</label>
              {user.gender ? (
                <div className="input-field bg-gray-100 cursor-not-allowed dark:bg-gray-700">
                  {user.gender === 'male' ? 'Male' : 
                   user.gender === 'female' ? 'Female' : 
                   user.gender === 'other' ? 'Other' : 
                   user.gender === 'prefer_not_to_say' ? 'Prefer not to say' : user.gender}
                </div>
              ) : (
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              )}
              {user.gender && <p className="text-xs text-muted dark:text-dark-muted mt-1">Gender cannot be changed once set</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">
                  {isAgency ? 'Agency Name' : 'Name'}
                </p>
                <p className="text-dark dark:text-light mt-1">
                  {isAgency ? user.agencyName : `${user.firstName} ${user.lastName}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Email</p>
                <p className="text-dark dark:text-light mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Phone</p>
                <p className="text-dark dark:text-light mt-1">{user.phone || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">County</p>
                <p className="text-dark dark:text-light mt-1">{user.county || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Gender</p>
                <p className="text-dark dark:text-light mt-1">
                  {user.gender === 'male' ? 'Male' : 
                   user.gender === 'female' ? 'Female' : 
                   user.gender === 'other' ? 'Other' : 
                   user.gender === 'prefer_not_to_say' ? 'Prefer not to say' : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Media Section */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-dark dark:text-light">Profile Media</h3>

        {isEditing ? (
          <div className="space-y-6">
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-2">Profile Photo</label>
              <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-card cursor-pointer hover:bg-background transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-muted dark:text-dark-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-dark dark:text-light">Upload photo</p>
                  <p className="text-xs text-muted dark:text-dark-muted">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </label>
              {profilePhoto && <p className="text-sm text-success">Photo selected</p>}
            </div>

            {/* Agency Logo Upload - only for agencies */}
            {isAgency && (
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">Agency Logo</label>
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-card cursor-pointer hover:bg-background transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 text-muted dark:text-dark-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-dark dark:text-light">Upload logo</p>
                    <p className="text-xs text-muted dark:text-dark-muted">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAgencyLogoChange}
                    className="hidden"
                  />
                </label>
                {agencyLogo && <p className="text-sm text-success">Logo selected</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-dark dark:text-light mb-2">Profile Photo</p>
              <img
                src={user.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-card object-cover"
              />
            </div>
            {isAgency && (
              <div>
                <p className="text-sm font-medium text-dark dark:text-light mb-2">Agency Logo</p>
                <img
                  src={user.logo}
                  alt="Logo"
                  className="w-32 h-32 rounded-card object-cover bg-background"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agency Verification Section - only for agencies */}
      {isAgency && (
        <div className="card space-y-4 border-l-4 border-primary">
          <h3 className="text-lg font-semibold text-dark dark:text-light">Agency Verification</h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">Registered Agency Name</label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">Agency Registration Number</label>
                <input
                  type="text"
                  name="agencyRegistrationNumber"
                  value={formData.agencyRegistrationNumber}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">Upload Registration Certificate</label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-card cursor-pointer hover:bg-background transition-colors">
                  <div className="text-center">
                    <svg className="w-6 h-6 text-muted dark:text-dark-muted mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium text-dark dark:text-light">Upload certificate (PDF/Image)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,.pdf" />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Agency Name</p>
                  <p className="text-dark dark:text-light mt-1">{user.agencyName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Registration Number</p>
                  <p className="text-dark dark:text-light mt-1">{user.agencyRegistrationNumber || 'Not set'}</p>
                </div>
              </div>
              <div className="p-3 bg-success bg-opacity-10 border border-success rounded-card">
                <p className="text-sm text-success font-medium">✓ Verified Agency</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save/Cancel buttons */}
      {isEditing && (
        <div className="flex gap-3 sticky bottom-24 bg-background dark:bg-dark-background pt-4 border-t border-border dark:border-dark-border">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="button-primary flex-1"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setFormData(user)
              setProfilePhoto(null)
              setAgencyLogo(null)
            }}
            className="button-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Logout button */}
      {!isEditing && (
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-error text-white rounded-card font-medium hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      )}
    </div>
  )
}
