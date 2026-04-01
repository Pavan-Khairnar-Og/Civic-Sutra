import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'

/**
 * Protected Route Component
 * Protects routes based on user roles and permissions
 * Redirects unauthorized users to appropriate pages
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = false,
  redirectTo = '/',
  fallback = null 
}) => {
  const { 
    isAuthenticated, 
    isGov, 
    isAnonymous, 
    loading,
    user
  } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-civic-parchment">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-orange"></div>
          <p className="text-civic-textSecondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated && !isAnonymous) {
    return <Navigate to={redirectTo} replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => {
      if (role === 'government') return isGov
      if (role === 'anonymous') return isAnonymous
      if (role === 'citizen') return !isAnonymous && !isGov
      return false
    })

    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-civic-parchment">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-civic-red rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-civic-textPrimary mb-4">Access Denied</h2>
            <p className="text-civic-textSecondary mb-6">
              You don't have permission to access this page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-civic-orange text-white rounded-lg font-medium hover:bg-civic-orangeHover transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-civic-muted text-civic-textSecondary rounded-lg font-medium hover:bg-civic-muted transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // User has access, render children
  return children
}

/**
 * Admin Only Route
 * Only allows government users
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const [checkingAccess, setCheckingAccess] = React.useState(true)
  const [hasAccess, setHasAccess] = React.useState(false)

  React.useEffect(() => {
    const checkGovernmentAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }

      // Check 1: user metadata (most reliable)
      const meta = user.user_metadata || {}
      const hasGovAccessViaMeta = 
        meta.user_type === 'government' ||
        meta.role === 'government'

      if (hasGovAccessViaMeta) {
        setHasAccess(true)
        setCheckingAccess(false)
        return
      }

      // Check 2: profiles table (fallback)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, user_type, department')
          .eq('id', user.id)
          .maybeSingle()

        const hasGovAccessViaProfile = 
          profile?.role === 'government' || 
          profile?.role === 'admin' ||
          profile?.user_type === 'government'

        setHasAccess(hasGovAccessViaProfile)
      } catch (e) {
        console.warn("Profile check failed:", e.message)
        setHasAccess(false)
      } finally {
        setCheckingAccess(false)
      }
    }

    checkGovernmentAccess()
  }, [user])

  // Show loading state while checking access
  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-civic-parchment">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-orange"></div>
          <p className="text-civic-textSecondary">Checking access...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Show access denied if no government access
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-civic-parchment">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-civic-red rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-civic-textPrimary mb-4">Access Denied</h2>
          <p className="text-civic-textSecondary mb-6">
            You don't have permission to access this page.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-civic-orange text-white rounded-lg font-medium hover:bg-civic-orangeHover transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 border border-civic-muted text-civic-textSecondary rounded-lg font-medium hover:bg-civic-muted transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User has access, render children
  return children
}

/**
 * Citizen Only Route
 * Allows citizens, government, and anonymous users
 */
export const CitizenRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      allowedRoles={['citizen', 'government', 'anonymous']}
      requireAuth={false} // Allow anonymous users too
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Authenticated Only Route
 * Requires authentication (any role except anonymous)
 */
export const AuthRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      allowedRoles={['citizen', 'government']}
      requireAuth={true}
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Public Route
 * Accessible to everyone including anonymous users
 */
export const PublicRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default ProtectedRoute
