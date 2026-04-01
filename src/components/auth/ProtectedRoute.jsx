import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Protected Route Component
 * Simplified to only check authentication, no role-based restrictions
 * Redirects unauthorized users to appropriate pages
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = false,
  redirectTo = '/',
  fallback = null 
}) => {
  const { 
    isAuthenticated, 
    loading
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
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // User has access, render children
  return children
}

/**
 * Admin Only Route
 * Simplified to allow any authenticated user (admin/dashboard accessible)
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User has access, render children
  return children
}

/**
 * Citizen Only Route
 * Simplified to allow any authenticated user
 */
export const CitizenRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Authenticated Only Route
 * Requires authentication
 */
export const AuthRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Public Route
 * Accessible to everyone
 */
export const PublicRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default ProtectedRoute
