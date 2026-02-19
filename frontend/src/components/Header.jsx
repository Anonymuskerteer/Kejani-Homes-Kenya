import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser } from '../api/auth'

export default function Header({ isLanding = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    if (isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }
  }, [location.pathname])

  const handleLogoClick = (e) => {
    e.preventDefault()
    if (user && user.role) {
      // Redirect to role-based dashboard
      switch (user.role) {
        case 'admin':
          navigate('/admin')
          break
        case 'landlord':
        case 'agency':
          navigate('/landlord-dashboard')
          break
        case 'tenant':
        default:
          navigate('/dashboard')
          break
      }
    } else {
      // Not logged in, go to landing page
      navigate('/')
    }
    setMobileMenuOpen(false)
  }

  const handleNavClick = (href) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      element?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(href)
    }
  }

  const navigationLinks = isLanding ? [
    { label: 'Find Property', href: '#featured' },
    { label: 'For Landlords', href: '#about' },
    { label: 'For Agents', href: '#about' },
    { label: 'About', href: '#about' },
  ] : []

  return (
    <header className={`sticky top-0 z-50 transition-all ${
      scrolled ? 'bg-white border-b border-border shadow-sm' : 'bg-white border-b border-border'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center text-white font-bold text-lg">K</div>
          <span className="font-bold text-text-primary hidden sm:inline">KEJANI HOMES</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-text-secondary hover:text-primary transition-colors font-medium text-sm"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isLanding ? (
            <>
              <Link to="/login" className="button-secondary px-4 py-2 text-sm">
                Login
              </Link>
              <Link to="/signup" className="button-primary px-4 py-2 text-sm">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <button className="relative p-2 hover:bg-background rounded-card transition-colors">
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <div className="relative">
                <button className="w-10 h-10 bg-primary rounded-full text-white font-bold flex-center hover:bg-primary-hover transition-colors">
                  U
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-background rounded-card transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navigationLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left py-2 text-text-primary hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
            <hr className="border-border my-3" />
            <div className="flex flex-col gap-2">
              <Link to="/login" className="button-secondary w-full text-center py-2">
                Login
              </Link>
              <Link to="/signup" className="button-primary w-full text-center py-2">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
