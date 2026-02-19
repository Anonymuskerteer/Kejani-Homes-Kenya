import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    return newErrors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
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
      const result = await login({
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        // Get the stored user to check their role
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = storedUser.role;
        
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'landlord':
          case 'agency':
            navigate('/landlord-dashboard');
            break;
          case 'tenant':
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        // Check if this is an unverified account
        if (result.data && result.data.isEmailVerified === false) {
          // Redirect to OTP verification page using window.location for reliability
          window.location.href = `/verify-email?otpToken=${result.data.otpToken}&email=${encodeURIComponent(result.data.email)}`
        } else {
          setGeneralError(result.error)
        }
      }
    } catch (error) {
      // Check if this is an unverified account from error response
      if (error.response?.data?.isEmailVerified === false) {
        window.location.href = `/verify-email?otpToken=${error.response.data.otpToken}&email=${encodeURIComponent(error.response.data.email)}`
      } else {
        setGeneralError(error.response?.data?.message || 'Login failed. Please try again.')
      }
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
            {/* Header with Logo */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary rounded-card flex items-center justify-center text-white">
                  <span className="text-3xl font-bold">K</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary">KEJANI HOMES</h1>
              <p className="text-text-secondary text-sm">Sign in to your account</p>
            </div>

            {/* Error message */}
            {generalError && (
              <div className="bg-error/10 border border-error text-error text-sm px-4 py-3 rounded-card">
                {generalError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
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

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
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

              {/* Remember Me */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border border-border rounded text-primary" />
                <span className="text-text-secondary text-sm">Remember me</span>
              </label>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="button-primary w-full py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
                  Forgot Password?
                </Link>
              </div>
            </form>

            {/* Signup Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-text-secondary text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
