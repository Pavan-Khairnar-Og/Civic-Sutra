import { useState, useEffect } from 'react'
import { auth } from '../services/supabase'

/**
 * Custom hook for authentication
 * Provides user authentication state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current user
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
        
        // Listen to auth state changes
        const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null)
          setLoading(false)
        })
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  /**
   * Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const signIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign in'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign up new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} metadata - Additional user metadata
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await auth.signUp(email, password, metadata)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign up'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const { error } = await auth.signOut()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      
      setUser(null)
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign out'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset error state
   */
  const resetError = () => {
    setError(null)
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetError,
    isAuthenticated: !!user
  }
}

export default useAuth
