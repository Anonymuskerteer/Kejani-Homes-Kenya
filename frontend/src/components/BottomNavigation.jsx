import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, MessageSquare, User, Heart, Building2 } from 'lucide-react';

export default function BottomNavigation({ userType = 'tenant' }) {
  const location = useLocation();

  const getNavItems = () => {
    if (userType === 'landlord' || userType === 'agency') {
      return [
        { path: '/landlord-dashboard', label: 'Home', icon: Home },
        { path: '/landlord-dashboard/listings', label: 'Listings', icon: Building2 },
        { path: '/landlord-dashboard/bookings', label: 'Bookings', icon: CalendarDays },
        { path: '/landlord-dashboard/chat', label: 'Chat', icon: MessageSquare },
        { path: '/landlord-dashboard/profile', label: 'Profile', icon: User },
      ];
    }
    // Tenant navigation
    return [
      { path: '/dashboard', label: 'Home', icon: Home },
      { path: '/dashboard/favourites', label: 'Saved', icon: Heart },
      { path: '/dashboard/bookings', label: 'Bookings', icon: CalendarDays },
      { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
      { path: '/dashboard/profile', label: 'Profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/landlord-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-dark-foreground/95 backdrop-blur-lg border-t border-border dark:border-dark-border z-30 safe-area-bottom overscroll-contain">
      <div className="flex justify-around h-14 sm:h-16 max-w-lg mx-auto w-full px-1 sm:px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 sm:px-1 transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light'
              }`}
            >
              <div className={`p-0.5 sm:p-1 rounded-lg transition-colors ${active ? 'bg-primary/10' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} className="sm:w-6 sm:h-6 w-5 h-5" />
              </div>
              <span className={`text-[9px] sm:text-xs mt-0.5 font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
