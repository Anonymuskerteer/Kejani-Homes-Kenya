import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailVerification from './pages/EmailVerification'
import AppLayout from './layouts/AppLayout'
import FindHome from './pages/tenant/FindHome'
import TenantChat from './pages/tenant/Chat'
import Bookings from './pages/tenant/Bookings'
import Favourites from './pages/tenant/Favourites'
import TenantProfile from './pages/tenant/Profile'
import MyListings from './pages/landlord/MyListings'
import LandlordChat from './pages/landlord/Chat'
import LandlordProfile from './pages/landlord/Profile'
import Settings from './pages/landlord/Settings'
import ListingDetails from './pages/tenant/ListingDetails'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/Home'
import AdminUsers from './pages/admin/Users'
import AdminListings from './pages/admin/Listings'
import AdminVerification from './pages/admin/Verification'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import AdminApi from './pages/admin/Api'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />

          {/* Protected routes - Tenant dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="tenant">
              <AppLayout userType="tenant" />
            </ProtectedRoute>
          }>
            <Route index element={<FindHome />} />
            <Route path="chat" element={<TenantChat />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="listings" element={<FindHome />} />
            <Route path="listings/:id" element={<ListingDetails />} />
            <Route path="listing/:id" element={<ListingDetails />} />
            <Route path="profile" element={<TenantProfile />} />
          </Route>

          {/* Protected routes - Landlord dashboard */}
          <Route path="/landlord-dashboard" element={
            <ProtectedRoute requiredRole="landlord">
              <AppLayout userType="landlord" />
            </ProtectedRoute>
          }>
            <Route index element={<MyListings />} />
            <Route path="chat" element={<LandlordChat />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="profile" element={<LandlordProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin dashboard routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="api" element={<AdminApi />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
