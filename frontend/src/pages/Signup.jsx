import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'

// Kenyan Counties List
const KENYAN_COUNTIES = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang\'a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita Taveta',
  'Tana River',
  'Transnzoia',
  'Turkana',
  'Tharaka Nithi',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
]

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    role: 'tenant',

    // Tenant fields
    tenantCounty: '',
    tenantPhone: '',

    // Agency fields
    agencyName: '',
    registrationNumber: '',
    registrationDate: '',
    companyLogo: null,

    // Landlord fields
    landlordProfilePhoto: null,
    landlordEmail: '',
    landlordPhone: '',
    landlordCounty: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateCommonFields = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    return newErrors
  }

  const validateRoleFields = () => {
    const newErrors = {}

    if (formData.role === 'tenant') {
      if (!formData.tenantCounty) {
        newErrors.tenantCounty = 'County of residence is required'
      }
      if (!formData.tenantPhone.trim()) {
        newErrors.tenantPhone = 'Phone number is required'
      } else if (!/^0[17]\d{8}$/.test(formData.tenantPhone.replace(/\s/g, ''))) {
        newErrors.tenantPhone = 'Phone number must start with 07 or 01 and be 10 digits'
      }
    }

    if (formData.role === 'agency') {
      if (!formData.agencyName.trim()) {
        newErrors.agencyName = 'Agency name is required'
      }
      if (!formData.registrationNumber.trim()) {
        newErrors.registrationNumber = 'Registration number is required'
      }
      if (!formData.registrationDate) {
        newErrors.registrationDate = 'Registration date is required'
      }
      if (!formData.companyLogo) {
        newErrors.companyLogo = 'Company logo is required'
      }
    }

    if (formData.role === 'landlord') {
      if (!formData.landlordProfilePhoto) {
        newErrors.landlordProfilePhoto = 'Profile photo is required'
      }
      if (!formData.landlordEmail.trim()) {
        newErrors.landlordEmail = 'Contact email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.landlordEmail)) {
        newErrors.landlordEmail = 'Please enter a valid email'
      }
      if (!formData.landlordPhone.trim()) {
        newErrors.landlordPhone = 'Phone number is required'
      } else if (!/^0[17]\d{8}$/.test(formData.landlordPhone.replace(/\s/g, ''))) {
        newErrors.landlordPhone = 'Phone number must start with 07 or 01 and be 10 digits'
      }
      if (!formData.landlordCounty) {
        newErrors.landlordCounty = 'County of residence is required'
      }
    }

    return newErrors
  }

  const validateForm = () => {
    const commonErrors = validateCommonFields()
    const roleErrors = validateRoleFields()
    return { ...commonErrors, ...roleErrors }
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files?.[0] || null }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleChange = (e) => {
    setFormData(prev => ({ ...prev, role: e.target.value }))
    // Clear role-specific errors when changing role
    setErrors(prev => {
      const newErrors = { ...prev }
      const roleFieldsToRemove = [
        'tenantCounty', 'tenantPhone',
        'agencyName', 'registrationNumber', 'registrationDate', 'companyLogo',
        'landlordProfilePhoto', 'landlordEmail', 'landlordPhone', 'landlordCounty',
      ]
      roleFieldsToRemove.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dateOfBirth: formData.dateOfBirth,
        role: formData.role,
        ...(formData.role === 'tenant' && {
          tenantCounty: formData.tenantCounty,
          tenantPhone: formData.tenantPhone,
        }),
        ...(formData.role === 'agency' && {
          agencyName: formData.agencyName,
          registrationNumber: formData.registrationNumber,
          registrationDate: formData.registrationDate,
          companyLogo: formData.companyLogo,
        }),
        ...(formData.role === 'landlord' && {
          landlordEmail: formData.landlordEmail,
          landlordPhone: formData.landlordPhone,
          landlordCounty: formData.landlordCounty,
          landlordProfilePhoto: formData.landlordProfilePhoto,
        }),
      })

      if (result.success) {
        // Redirect to OTP verification page with email and token using window.location
        window.location.href = `/verify-email?otpToken=${result.data.otpToken}&email=${encodeURIComponent(formData.email)}`
      } else {
        setGeneralError(result.error)
      }
    } catch (error) {
      setGeneralError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="flex items-center justify-center py-12 px-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="card space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
              <p className="text-text-secondary text-sm">Join KEJANI HOMES today</p>
            </div>

            {/* Error message */}
            {generalError && (
              <div className="bg-error/10 border border-error text-error text-sm px-4 py-3 rounded-card">
                {generalError}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* COMMON FIELDS SECTION */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Personal Information</div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className={`input-field ${errors.firstName ? 'border-error focus:ring-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="text-error text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className={`input-field ${errors.lastName ? 'border-error focus:ring-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="text-error text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`input-field ${errors.email ? 'border-error focus:ring-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-error text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`input-field ${errors.dateOfBirth ? 'border-error focus:ring-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-error text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`input-field ${errors.password ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a7 7 0 016.642 10.867l-2.227-2.227a4.001 4.001 0 00-5.648-5.648L8.358 4.867A6.975 6.975 0 0110 3zm5.196 7.584a4 4 0 01-5.648 5.648l2.227 2.227A6.972 6.972 0 0110 17a7 7 0 01-6.642-10.867l2.227 2.227a4 4 0 015.648 5.648z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-error text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`input-field ${errors.confirmPassword ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a7 7 0 016.642 10.867l-2.227-2.227a4.001 4.001 0 00-5.648-5.648L8.358 4.867A6.975 6.975 0 0110 3zm5.196 7.584a4 4 0 01-5.648 5.648l2.227 2.227A6.972 6.972 0 0110 17a7 7 0 01-6.642-10.867l2.227 2.227a4 4 0 015.648 5.648z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* ROLE SELECTOR */}
              <div className="space-y-4 border-t border-b border-border py-4">
                <label className="block text-sm font-medium text-text-primary">What is your role?</label>
                <div className="space-y-2">
                  {[
                    { value: 'tenant', label: 'Tenant (Looking for a house)' },
                    { value: 'agency', label: 'Agency (Property management company)' },
                    { value: 'landlord', label: 'Landlord (Property owner)' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center p-3 border border-border rounded-card cursor-pointer hover:bg-background transition-colors" style={{ borderColor: formData.role === option.value ? '#317E3D' : '#E5E7EB' }}>
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={handleRoleChange}
                        className="mr-3"
                        disabled={loading}
                      />
                      <span className="text-sm font-medium text-text-primary">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* DYNAMIC ROLE-SPECIFIC FIELDS */}

              {/* TENANT FIELDS */}
              {formData.role === 'tenant' && (
                <div className="space-y-4 border-t border-b border-border py-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Tenant Information</div>

                  {/* County */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">County of Residence</label>
                    <select
                      name="tenantCounty"
                      value={formData.tenantCounty}
                      onChange={handleInputChange}
                      className={`input-field ${errors.tenantCounty ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select your county...</option>
                      {KENYAN_COUNTIES.map(county => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                    {errors.tenantCounty && (
                      <p className="text-error text-sm mt-1">{errors.tenantCounty}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="tenantPhone"
                      value={formData.tenantPhone}
                      onChange={handleInputChange}
                      placeholder="+254 712 345 678"
                      className={`input-field ${errors.tenantPhone ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.tenantPhone && (
                      <p className="text-error text-sm mt-1">{errors.tenantPhone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* AGENCY FIELDS */}
              {formData.role === 'agency' && (
                <div className="space-y-4 border-t border-b border-border py-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Agency Information</div>

                  {/* Agency Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Agency Name</label>
                    <input
                      type="text"
                      name="agencyName"
                      value={formData.agencyName}
                      onChange={handleInputChange}
                      placeholder="Your agency name"
                      className={`input-field ${errors.agencyName ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.agencyName && (
                      <p className="text-error text-sm mt-1">{errors.agencyName}</p>
                    )}
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="REG123456"
                      className={`input-field ${errors.registrationNumber ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.registrationNumber && (
                      <p className="text-error text-sm mt-1">{errors.registrationNumber}</p>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Date of Registration</label>
                    <input
                      type="date"
                      name="registrationDate"
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                      className={`input-field ${errors.registrationDate ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.registrationDate && (
                      <p className="text-error text-sm mt-1">{errors.registrationDate}</p>
                    )}
                  </div>

                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Company Logo</label>
                    <div className={`border-2 border-dashed rounded-card p-4 text-center cursor-pointer hover:bg-background transition-colors ${
                      errors.companyLogo ? 'border-error' : 'border-border'
                    }`}>
                      <input
                        type="file"
                        name="companyLogo"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                        id="companyLogo"
                        disabled={loading}
                      />
                      <label htmlFor="companyLogo" className="cursor-pointer">
                        {formData.companyLogo ? (
                          <div className="space-y-2">
                            <svg className="w-8 h-8 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-text-primary">{formData.companyLogo.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg className="w-8 h-8 mx-auto text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-sm font-medium text-text-primary">Click to upload logo</p>
                            <p className="text-xs text-text-secondary">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.companyLogo && (
                      <p className="text-error text-sm mt-1">{errors.companyLogo}</p>
                    )}
                  </div>
                </div>
              )}

              {/* LANDLORD FIELDS */}
              {formData.role === 'landlord' && (
                <div className="space-y-4 border-t border-b border-border py-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Landlord Information</div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Profile Photo</label>
                    <div className={`border-2 border-dashed rounded-card p-4 text-center cursor-pointer hover:bg-background transition-colors ${
                      errors.landlordProfilePhoto ? 'border-error' : 'border-border'
                    }`}>
                      <input
                        type="file"
                        name="landlordProfilePhoto"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                        id="landlordProfilePhoto"
                        disabled={loading}
                      />
                      <label htmlFor="landlordProfilePhoto" className="cursor-pointer">
                        {formData.landlordProfilePhoto ? (
                          <div className="space-y-2">
                            <svg className="w-8 h-8 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-text-primary">{formData.landlordProfilePhoto.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg className="w-8 h-8 mx-auto text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-sm font-medium text-text-primary">Click to upload photo</p>
                            <p className="text-xs text-text-secondary">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.landlordProfilePhoto && (
                      <p className="text-error text-sm mt-1">{errors.landlordProfilePhoto}</p>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="landlordEmail"
                      value={formData.landlordEmail}
                      onChange={handleInputChange}
                      placeholder="contact@example.com"
                      className={`input-field ${errors.landlordEmail ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.landlordEmail && (
                      <p className="text-error text-sm mt-1">{errors.landlordEmail}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="landlordPhone"
                      value={formData.landlordPhone}
                      onChange={handleInputChange}
                      placeholder="+254 712 345 678"
                      className={`input-field ${errors.landlordPhone ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.landlordPhone && (
                      <p className="text-error text-sm mt-1">{errors.landlordPhone}</p>
                    )}
                  </div>

                  {/* County */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">County of Residence</label>
                    <select
                      name="landlordCounty"
                      value={formData.landlordCounty}
                      onChange={handleInputChange}
                      className={`input-field ${errors.landlordCounty ? 'border-error focus:ring-error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select your county...</option>
                      {KENYAN_COUNTIES.map(county => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                    {errors.landlordCounty && (
                      <p className="text-error text-sm mt-1">{errors.landlordCounty}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="button-primary w-full py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-text-secondary text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
