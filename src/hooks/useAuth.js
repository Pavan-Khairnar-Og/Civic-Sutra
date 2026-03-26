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
      
      // Validate inputs
      if (!email || !password) {
        const errorMessage = 'Email and password are required'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        const errorMessage = 'Please enter a valid email address'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      if (password.length < 6) {
        const errorMessage = 'Password must be at least 6 characters long'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      console.log('Attempting sign in with email:', email)
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        console.error('Sign in error:', error)
        const errorMessage = error.message || 'Failed to sign in'
        setError(errorMessage)
        return { success: false, error: errorMessage, details: error }
      }
      
      console.log('Sign in successful:', data)
      setUser(data.user)
      return { success: true, data }
    } catch (err) {
      console.error('Sign in exception:', err)
      const errorMessage = err.message || 'Failed to sign in'
      setError(errorMessage)
      return { success: false, error: errorMessage, details: err }
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
      
      // Validate inputs
      if (!email || !password) {
        const errorMessage = 'Email and password are required'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        const errorMessage = 'Please enter a valid email address'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      if (password.length < 6) {
        const errorMessage = 'Password must be at least 6 characters long'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      console.log('Attempting sign up with email:', email)
      
      const { data, error } = await auth.signUp(email, password, metadata)
      
      if (error) {
        console.error('Sign up error:', error)
        const errorMessage = error.message || 'Failed to sign up'
        setError(errorMessage)
        return { success: false, error: errorMessage, details: error }
      }
      
      console.log('Sign up successful:', data)
      return { success: true, data }
    } catch (err) {
      console.error('Sign up exception:', err)
      const errorMessage = err.message || 'Failed to sign up'
      setError(errorMessage)
      return { success: false, error: errorMessage, details: err }
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
