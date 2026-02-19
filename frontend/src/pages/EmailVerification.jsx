import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail, verifyOTP, resendOTP } from '../api/auth'

export default function EmailVerification() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const otpToken = searchParams.get('otpToken') || ''
  const email = searchParams.get('email') || ''
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  
  // OTP specific states
  const [isOTP, setIsOTP] = useState(false)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [resendMessage, setResendMessage] = useState('')
  
  const inputRefs = useRef([])

  // Debug: Log params on mount
  useEffect(() => {
    console.log('EmailVerification mounted with params:', { token: token.substring(0, 20) + '...', otpToken: otpToken.substring(0, 20) + '...', email })
  }, [])

  useEffect(() => {
    // Check if this is an OTP verification flow
    if (otpToken && email) {
      console.log('OTP flow detected - setting isOTP true')
      setIsOTP(true)
      setLoading(false)
      return
    }

    // If no token at all, show error
    if (!token && !otpToken) {
      setError('Invalid verification link. Please check your email for the verification link.')
      setLoading(false)
      return
    }

    // Original token-based verification
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid verification token')
        setLoading(false)
        return
      }

      const result = await verifyEmail(token)
      
      if (result.success) {
        setMessage(result.data.message || 'Email verified successfully!')
        setVerified(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.error)
      }
      
      setLoading(false)
    }

    verifyToken()
  }, [token, otpToken, email, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 4 digits are filled
    if (newOtp.every(digit => digit !== '') && index === 3) {
      handleVerifyOTP(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    setOtpLoading(true)
    setError('')

    const result = await verifyOTP(otpCode, otpToken)
    
    if (result.success) {
      setMessage(result.data.message || 'Email verified successfully!')
      setVerified(true)
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } else {
      setError(result.error)
      setOtp(['', '', '', ''])
      inputRefs.current[0]?.focus()
    }
    
    setOtpLoading(false)
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setResendLoading(true)
    setError('')
    setResendMessage('')

    const result = await resendOTP(email)
    
    if (result.success) {
      setResendMessage(result.data.message)
      // Update otpToken if new OTP was generated
      if (result.data.otpToken) {
        // Update URL with new token if needed
        window.history.replaceState(null, '', `/verify-email?otpToken=${result.data.otpToken}&email=${email}`)
      }
      setCountdown(60) // 60 second cooldown
      setOtp(['', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      setError(result.error)
    }
    
    setResendLoading(false)
  }

  // For users who don't have a token, allow them to request new OTP by email
  const [resendEmail, setResendEmail] = useState('')
  const [requestingNewOTP, setRequestingNewOTP] = useState(false)

  const handleRequestNewOTP = async (e) => {
    e.preventDefault()
    if (!resendEmail) {
      setError('Please enter your email address')
      return
    }

    setResendLoading(true)
    setError('')
    setResendMessage('')

    const result = await resendOTP(resendEmail)
    
    if (result.success) {
      setResendMessage(result.data.message)
      if (result.data.otpToken) {
        // Navigate to OTP verification page with new token
        navigate(`/verify-email?otpToken=${result.data.otpToken}&email=${encodeURIComponent(resendEmail)}`)
      }
    } else {
      setError(result.error)
    }
    
    setResendLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">Redirecting to login...</p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // OTP Verification View
  if (isOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">Enter the 4-digit code sent to</p>
            <p className="text-primary font-medium">{email}</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {resendMessage}
            </div>
          )}

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                disabled={otpLoading}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerifyOTP()}
            disabled={otpLoading || otp.join('').length !== 4}
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {otpLoading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || countdown > 0}
              className="w-full py-3 px-6 bg-gray-100 text-primary font-semibold rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
            >
              {resendLoading 
                ? 'Sending...' 
                : countdown > 0 
                  ? `Resend code in ${countdown}s` 
                  : 'Resend Verification Code'
              }
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/signup" className="text-gray-500 hover:text-primary">
              Create new account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Original Token Verification Error View
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          {/* Option to request new OTP */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Didn't receive the verification code?</p>
            <form onSubmit={handleRequestNewOTP} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400 transition-colors font-semibold"
              >
                {resendLoading ? 'Sending...' : 'Request New Code'}
              </button>
            </form>
          </div>
          
          <div className="mt-6">
            <Link to="/signup" className="text-primary hover:underline">
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
