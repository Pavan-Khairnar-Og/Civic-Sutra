import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute component
 * Protects routes based on authentication and role requirements
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isGov, isAnonymous, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-civic-parchment">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-orange"></div>
      </div>
    )
  }

  // If not authenticated at all, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // If government role required and user is not gov, redirect to home
  if (requiredRole === 'gov' && !isGov) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default ProtectedRoute
