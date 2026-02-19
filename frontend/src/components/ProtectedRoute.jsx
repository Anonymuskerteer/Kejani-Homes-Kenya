// Protected Route Component
// Wraps routes that require authentication and specific roles
// Redirects to login if not authenticated, shows error if wrong role

import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser, isAuthenticated } from '../api/auth'

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation()
  const authenticated = isAuthenticated()
  const user = getCurrentUser()

  // Not logged in - redirect to login with return path
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    // User has wrong role - redirect to their appropriate dashboard
    const roleRoutes = {
      admin: '/admin',
      landlord: '/landlord-dashboard',
      agency: '/landlord-dashboard',
      tenant: '/dashboard',
    }
    
    const redirectPath = roleRoutes[user?.role] || '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  // Authenticated and has correct role
  return children
}