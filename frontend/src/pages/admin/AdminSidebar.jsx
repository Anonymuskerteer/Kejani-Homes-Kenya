// Admin Sidebar Component
// Fixed sidebar for desktop, slide-out drawer for mobile
// Supports dark mode and current path highlighting

import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: HomeIcon },
  { path: '/admin/users', label: 'Users', icon: UsersIcon },
  { path: '/admin/listings', label: 'Listings', icon: BuildingIcon },
  { path: '/admin/verification', label: 'Verification', icon: CheckBadgeIcon },
  { path: '/admin/reports', label: 'Reports', icon: FlagIcon },
  { path: '/admin/api', label: 'API', icon: KeyIcon },
  { path: '/admin/settings', label: 'Settings', icon: CogIcon },
];

export default function AdminSidebar({ isOpen, onClose, currentPath }) {
  return (
    <>
      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-dark-foreground border-r border-border dark:border-dark-border
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent navItems={navItems} onClose={onClose} currentPath={currentPath} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px] lg:bg-white lg:dark:bg-dark-foreground lg:border-r lg:border-border dark:lg:border-dark-border">
        <SidebarContent navItems={navItems} currentPath={currentPath} />
      </aside>
    </>
  );
}

function SidebarContent({ navItems, onClose, currentPath }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border dark:border-dark-border">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-dark dark:text-light">KEJANI</h1>
          <p className="text-xs text-muted dark:text-dark-muted">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${isActive || currentPath === item.path
                    ? 'bg-primary text-white'
                    : 'text-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-background hover:text-dark dark:hover:text-light'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Admin Info */}
      <div className="p-4 border-t border-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-dark dark:text-light truncate">Admin User</p>
            <p className="text-xs text-muted dark:text-dark-muted truncate">admin@kejani.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

AdminSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentPath: PropTypes.string,
};

SidebarContent.propTypes = {
  navItems: PropTypes.array.isRequired,
  onClose: PropTypes.func,
  currentPath: PropTypes.string,
};

// Icon Components
function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function BuildingIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function CheckBadgeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function FlagIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  );
}

function CogIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function KeyIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.678L12 18l-1.257-2.322A6 6 0 0112 6a6 6 0 018 6z" />
    </svg>
  );
}
