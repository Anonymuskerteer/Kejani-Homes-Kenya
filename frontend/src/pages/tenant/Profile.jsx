import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'
import { getCurrentUser, updateProfile, logout } from '../../api/users'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

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
      
      // Transform the API response to match the component's expected format
      const formattedUser = {
        id: userData._id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        phone: userData.tenantPhone || '',
        // Generate gender-specific avatar
        avatar: userData.avatar || (userData.gender 
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}&gender=${userData.gender}`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`),
        bio: userData.bio || 'Looking for a comfortable home',
        gender: userData.gender || '',
        rating: userData.rating || 0,
        reviews: userData.reviews || 0,
        joinedDate: new Date(userData.createdAt),
        createdListingsCount: 0,
        completedBookingsCount: stats.completedBookingsCount || 0,
      }

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

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      // Prepare update data - exclude email and read-only fields
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tenantPhone: formData.phone,
        bio: formData.bio,
        gender: formData.gender,
      }

      const response = await updateProfile(updateData)
      
      // Update local state with the response
      const updatedUser = {
        ...formData,
        ...response.user,
      }
      
      setUser(updatedUser)
      setIsEditing(false)
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card text-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full border-4 border-primary object-cover"
          />
          {!isEditing && (
            <div>
              <h2 className="text-2xl font-bold text-dark dark:text-light">{user.firstName} {user.lastName}</h2>
              <p className="text-muted dark:text-dark-muted">{user.email}</p>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(user.rating) ? 'text-accent fill-accent' : 'text-gray-300 dark:text-gray-600'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-dark dark:text-light font-medium">{user.rating}</span>
            <span className="text-sm text-muted dark:text-dark-muted">({user.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark dark:text-light">Personal Details</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="button-secondary text-sm px-3 py-1"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                className="input-field bg-gray-100 cursor-not-allowed dark:bg-gray-700"
                disabled
              />
              <p className="text-xs text-muted dark:text-dark-muted mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-1">Gender</label>
              {user.gender ? (
                <div className="input-field bg-gray-100 dark:bg-gray-700">
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
            <div>
              <label className="block text-sm font-medium text-dark dark:text-light mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
              />
            </div>
            <div className="flex gap-2 pt-4">
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
                }}
                className="button-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">First Name</p>
                <p className="text-dark dark:text-light">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Last Name</p>
                <p className="text-dark dark:text-light">{user.lastName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Email</p>
              <p className="text-dark dark:text-light">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Phone</p>
              <p className="text-dark dark:text-light">{user.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Gender</p>
              <p className="text-dark dark:text-light">
                {user.gender === 'male' ? 'Male' :
                 user.gender === 'female' ? 'Female' :
                 user.gender === 'other' ? 'Other' :
                 user.gender === 'prefer_not_to_say' ? 'Prefer not to say' : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Bio</p>
              <p className="text-dark dark:text-light">{user.bio}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Joined</p>
              <p className="text-dark dark:text-light">
                {user.joinedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{user.completedBookingsCount}</p>
          <p className="text-muted dark:text-dark-muted text-sm">Completed Bookings</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{user.reviews}</p>
          <p className="text-muted dark:text-dark-muted text-sm">Reviews</p>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-error text-white rounded-card font-medium hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  )
}
