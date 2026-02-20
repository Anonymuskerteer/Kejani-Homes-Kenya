import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import BottomNavigation from '../components/BottomNavigation'
import { getCurrentUser, getUserAvatar } from '../api/auth'
import { 
  Home, 
  CalendarDays, 
  MessageSquare, 
  User, 
  Heart,
  Building2,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const user = getCurrentUser()
  
  // Determine user type from user object
  const userType = user?.role === 'landlord' || user?.role === 'agency' ? 'landlord' : 'tenant'

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const getNavItems = () => {
    if (userType === 'landlord' || userType === 'agency') {
      return [
        { path: '/landlord-dashboard', label: 'Home', icon: Home },
        { path: '/landlord-dashboard/listings', label: 'Listings', icon: Building2 },
        { path: '/landlord-dashboard/bookings', label: 'Bookings', icon: CalendarDays },
        { path: '/landlord-dashboard/chat', label: 'Chat', icon: MessageSquare },
        { path: '/landlord-dashboard/profile', label: 'Profile', icon: User },
      ]
    }
    // Tenant navigation - matches bottom navigation exactly
    return [
      { path: '/dashboard', label: 'Home', icon: Home },
      { path: '/dashboard/favourites', label: 'Saved', icon: Heart },
      { path: '/dashboard/bookings', label: 'Bookings', icon: CalendarDays },
      { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
      { path: '/dashboard/profile', label: 'Profile', icon: User },
    ]
  }

  const navItems = getNavItems()

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/landlord-dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen min-h-[100dvh] bg-background dark:bg-dark-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop fixed, Mobile slide-out */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-foreground border-r border-border dark:border-dark-border
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-border dark:border-dark-border">
            <div 
              onClick={() => navigate(userType === 'landlord' ? '/landlord-dashboard' : '/dashboard')} 
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                K
              </div>
              <div>
                <h1 className="font-bold text-lg text-dark dark:text-light">KEJANI</h1>
                <p className="text-xs text-muted dark:text-dark-muted">Homes</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-background rounded-lg"
            >
              <X className="w-5 h-5 text-muted dark:text-dark-muted" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path)
                        setSidebarOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                        ${isActive(item.path)
                          ? 'bg-primary text-white shadow-md'
                          : 'text-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-background hover:text-dark dark:hover:text-light'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold overflow-hidden cursor-pointer"
                onClick={() => {
                  navigate(userType === 'landlord' ? '/landlord-dashboard/profile' : '/dashboard/profile')
                  setSidebarOpen(false)
                }}
              >
                {getUserAvatar(user) ? (
                  <img src={getUserAvatar(user)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark dark:text-light truncate">
                  {user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : 'User'}
                </p>
                <p className="text-xs text-muted dark:text-dark-muted truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-h-screen lg:h-screen lg:ml-0">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 sticky top-0 z-30 bg-white/80 dark:bg-dark-foreground/80 backdrop-blur-lg border-b border-border dark:border-dark-border">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-background rounded-lg"
            >
              <Menu className="w-6 h-6 text-muted dark:text-dark-muted" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-dark-muted" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-background border border-transparent focus:border-primary dark:focus:border-primary rounded-lg text-sm text-dark dark:text-light placeholder-muted dark:placeholder-dark-muted focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-dark-background rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-muted dark:text-dark-muted" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile button - Desktop only */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 bg-primary rounded-full text-white font-bold flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden"
                >
                  {getUserAvatar(user) ? (
                    <img src={getUserAvatar(user)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'
                  )}
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-lg py-1">
                    <button
                      onClick={() => {
                        navigate(userType === 'landlord' ? '/landlord-dashboard/profile' : '/dashboard/profile')
                        setShowProfileMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-background transition-colors text-dark dark:text-light text-sm"
                    >
                      My Profile
                    </button>
                    <button 
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-background transition-colors text-dark dark:text-light text-sm"
                    >
                      Settings
                    </button>
                    <hr className="border-border dark:border-dark-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-32 lg:pb-6 overflow-y-auto overflow-x-hidden overscroll-contain min-h-0 w-full">
          <Outlet />
        </main>

        {/* Bottom Navigation - Mobile only */}
        <BottomNavigation userType={userType} />
      </div>
    </div>
  )
}
