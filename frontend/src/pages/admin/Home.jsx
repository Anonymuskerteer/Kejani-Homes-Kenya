// Admin Dashboard Home
// Overview of platform activity with metrics and recent activities

import { useState, useEffect } from 'react'
import { getDashboardMetrics, getRecentActivities } from '../../api/adminReports'
import LoadingState from '../../components/LoadingState'
import ErrorState from '../../components/ErrorState'

// Metric Card Component
function MetricCard({ title, value, trend, trendLabel, icon: Icon }) {
  const isPositive = trend >= 0
  return (
    <div className="card dark:bg-dark-foreground">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted dark:text-dark-muted text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-primary mt-2">{value}</p>
          <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-success' : 'text-error'}`}>
            <svg className={`w-4 h-4 ${!isPositive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
            </svg>
            {Math.abs(trend)}% {trendLabel}
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          {Icon && <Icon className="w-6 h-6 text-primary" />}
        </div>
      </div>
    </div>
  )
}

// Icons
function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function BuildingIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function FlagIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  )
}

export default function AdminHome() {
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch metrics and activities
      const [metricsRes, activitiesRes] = await Promise.all([
        getDashboardMetrics(),
        getRecentActivities(10),
      ])
      
      setStats(metricsRes.metrics || {
        totalUsers: 0,
        activeListings: 0,
        bookingsToday: 0,
        reportsPending: 0,
      })
      setRecentActivities(activitiesRes.activities || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Dashboard Overview</h1>
          <p className="text-muted dark:text-dark-muted mt-1">Welcome back! Here's what's happening on your platform.</p>
        </div>
        <LoadingState count={4} type="card" />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Dashboard Overview</h1>
        </div>
        <ErrorState 
          title="Failed to load dashboard" 
          description={error}
          onRetry={fetchDashboardData} 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-light">Dashboard Overview</h1>
        <p className="text-muted dark:text-dark-muted mt-1">Welcome back! Here's what's happening on your platform.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={(stats?.totalUsers || 0).toLocaleString()}
          trend={stats?.usersTrend || 12}
          trendLabel="vs last month"
          icon={UsersIcon}
        />
        <MetricCard
          title="Active Listings"
          value={(stats?.activeListings || 0).toLocaleString()}
          trend={stats?.listingsTrend || 8}
          trendLabel="vs last month"
          icon={BuildingIcon}
        />
        <MetricCard
          title="Bookings Today"
          value={stats?.bookingsToday || 0}
          trend={stats?.bookingsTrend || 23}
          trendLabel="vs yesterday"
          icon={CalendarIcon}
        />
        <MetricCard
          title="Reports Pending"
          value={stats?.reportsPending || 0}
          trend={stats?.reportsTrend || -5}
          trendLabel="vs last week"
          icon={FlagIcon}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 card dark:bg-dark-foreground">
          <div className="px-6 py-4 border-b border-border dark:border-dark-border">
            <h2 className="text-lg font-semibold text-dark dark:text-light">Recent Activities</h2>
          </div>
          <div className="divide-y divide-border dark:divide-dark-border max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-dark-background transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activity.type === 'user' ? 'bg-success/10' : 
                    activity.type === 'listing' ? 'bg-primary/10' : 'bg-error/10'
                  }`}>
                    {activity.type === 'user' ? (
                      <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : activity.type === 'listing' ? (
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark dark:text-light">{activity.message}</p>
                    <p className="text-xs text-muted dark:text-dark-muted mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-muted dark:text-dark-muted text-sm">No recent activities</p>
              </div>
            )}
          </div>
          {recentActivities.length > 0 && (
            <div className="px-6 py-4 border-t border-border dark:border-dark-border">
              <a href="/admin/reports" className="text-sm text-primary hover:text-primary-hover font-medium">
                View all activities →
              </a>
            </div>
          )}
        </div>

        {/* Analytics Placeholder */}
        <div className="card dark:bg-dark-foreground">
          <div className="px-6 py-4 border-b border-border dark:border-dark-border">
            <h2 className="text-lg font-semibold text-dark dark:text-light">Platform Analytics</h2>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-100 dark:bg-dark-background rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-border dark:text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-muted dark:text-dark-muted mt-4">Analytics coming soon</p>
                <p className="text-xs text-muted dark:text-dark-muted mt-1">Charts and insights will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
