// Admin Header Component
// Sticky header with search, notifications, and admin profile menu
// Supports dark mode

import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function AdminHeader({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-dark-foreground border-b border-border dark:border-dark-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light hover:bg-gray-100 dark:hover:bg-dark-background rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page Title - Desktop */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-dark dark:text-light">Admin Dashboard</h1>
            <p className="text-sm text-muted dark:text-dark-muted">Manage your platform</p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted dark:text-dark-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search users, listings, reports..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-background border border-border dark:border-dark-border rounded-lg text-dark dark:text-light placeholder-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 text-muted dark:text-dark-muted hover:text-dark dark:hover:text-light hover:bg-gray-100 dark:hover:bg-dark-background rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-border dark:border-dark-border">
                  <h3 className="font-semibold text-dark dark:text-light">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <NotificationItem
                    title="New User Registration"
                    message="John Doe has registered as a tenant"
                    time="2 min ago"
                  />
                  <NotificationItem
                    title="Listing Pending Approval"
                    message="3 new listings awaiting approval"
                    time="1 hour ago"
                  />
                  <NotificationItem
                    title="Report Submitted"
                    message="A new report has been submitted"
                    time="3 hours ago"
                  />
                </div>
                <div className="px-4 py-2 border-t border-border dark:border-dark-border">
                  <Link to="/admin/reports" className="text-sm text-primary hover:text-primary-hover">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 hover:bg-foreground dark:hover:bg-dark-background rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              <svg className="w-4 h-4 text-muted dark:text-dark-muted hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-border dark:border-dark-border">
                  <p className="font-medium text-dark dark:text-light">Admin User</p>
                  <p className="text-sm text-muted dark:text-dark-muted">admin@kejani.com</p>
                </div>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-muted dark:text-dark-muted hover:bg-foreground dark:hover:bg-dark-background hover:text-dark dark:hover:text-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-left text-error hover:bg-foreground dark:hover:bg-dark-background transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationItem({ title, message, time }) {
  return (
    <div className="px-4 py-3 hover:bg-foreground dark:hover:bg-dark-background cursor-pointer transition-colors">
      <p className="font-medium text-dark dark:text-light text-sm">{title}</p>
      <p className="text-muted dark:text-dark-muted text-sm truncate">{message}</p>
      <p className="text-muted dark:text-dark-muted text-xs mt-1">{time}</p>
    </div>
  );
}

NotificationItem.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  time: PropTypes.string,
};

AdminHeader.propTypes = {
  onMenuClick: PropTypes.func,
};
