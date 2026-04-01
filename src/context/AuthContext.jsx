import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

/**
 * CivicSutra Authentication Context
 * Integrates with Supabase Auth for proper authentication
 */

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = (userData) => {
    // Store additional user data in localStorage for role-based UI
    const userWithRole = {
      ...userData,
      role: userData.role || 'citizen'
    }
    localStorage.setItem('civicsutra_user', JSON.stringify(userWithRole))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('civicsutra_user')
    window.location.href = '/login'
  }

  // Computed values
  const isAuthenticated = !!user
  const isGov = user?.role === 'gov' || user?.role === 'government'
  const isAnonymous = !user || user?.role === 'anonymous'

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isGov,
    isAnonymous,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Higher-order component to protect routes that require authentication
 * @param {React.Component} Component - Component to protect
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {React.Component} Protected component
 */
export const withAuth = (Component, allowedRoles = []) => {
  return function ProtectedComponent(props) {
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
    if (allowedRoles.includes('gov') && !isGov) {
      return <Navigate to="/home" replace />
    }

    return <Component {...props} />
  }
}
