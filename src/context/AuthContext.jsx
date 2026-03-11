import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

/**
 * Authentication Context
 * Provides global authentication state and methods throughout the application
 */

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  isAdmin: false
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT'
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isAdmin: action.payload?.user_metadata?.role === 'admin',
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

/**
 * AuthProvider component
 * Wraps the application and provides authentication context
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const authHook = useAuth()

  // Update context state when auth hook state changes
  useEffect(() => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: authHook.loading })
    
    if (authHook.user) {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: authHook.user })
    }
    
    if (authHook.error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: authHook.error })
    }
  }, [authHook.user, authHook.loading, authHook.error])

  /**
   * Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const signIn = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    
    const result = await authHook.signIn(email, password)
    
    if (!result.success) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.error })
    }
    
    return result
  }

  /**
   * Sign up new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} metadata - Additional user metadata
   */
  const signUp = async (email, password, metadata = {}) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    
    const result = await authHook.signUp(email, password, metadata)
    
    if (!result.success) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.error })
    }
    
    return result
  }

  /**
   * Sign out current user
   */
  const signOut = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    
    const result = await authHook.signOut()
    
    if (result.success) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.error })
    }
    
    return result
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    authHook.resetError()
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    if (!state.user) return false
    return state.user.user_metadata?.role === role
  }

  /**
   * Check if user can perform admin actions
   * @returns {boolean} True if user is admin
   */
  const canAccessAdmin = () => {
    return state.isAdmin || hasRole('admin')
  }

  const value = {
    // State
    ...state,
    
    // Actions
    signIn,
    signUp,
    signOut,
    clearError,
    
    // Helper methods
    hasRole,
    canAccessAdmin,
    
    // Actions constants (for external use if needed)
    AUTH_ACTIONS
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Higher-order component to protect routes that require authentication
 * @param {React.Component} Component - Component to protect
 * @returns {React.Component} Protected component
 */
export const withAuth = (Component) => {
  return function ProtectedComponent(props) {
    const { isAuthenticated, loading } = useAuthContext()
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

/**
 * Higher-order component to protect admin routes
 * @param {React.Component} Component - Component to protect
 * @returns {React.Component} Protected admin component
 */
export const withAdminAuth = (Component) => {
  return function ProtectedAdminComponent(props) {
    const { canAccessAdmin, isAuthenticated, loading } = useAuthContext()
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )
    }
    
    if (!canAccessAdmin()) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

export default AuthContext
