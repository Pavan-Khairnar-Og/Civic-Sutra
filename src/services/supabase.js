import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client configuration
 * This file handles the connection to Supabase for database, auth, and storage
 */

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Authentication functions
 */
export const auth = {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} metadata - Additional user metadata
   */
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  /**
   * Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Listen to auth state changes
   * @param {function} callback - Callback function for auth state changes
   */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

/**
 * Database functions for reports
 */
export const reports = {
  /**
   * Create a new report
   * @param {object} reportData - Report data
   */
  create: async (reportData) => {
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        ...reportData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    return { data, error }
  },

  /**
   * Get all reports
   * @param {object} filters - Query filters
   * @param {object} options - Query options (ordering, pagination)
   */
  getAll: async (filters = {}, options = {}) => {
    let query = supabase
      .from('reports')
      .select('*')

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        query = query.eq(key, filters[key])
      }
    })

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending || false })
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  /**
   * Get reports by user ID
   * @param {string} userId - User ID
   * @param {object} filters - Additional filters
   */
  getByUser: async (userId, filters = {}) => {
    let query = supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)

    // Apply additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        query = query.eq(key, filters[key])
      }
    })

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    return { data, error }
  },

  /**
   * Get a single report by ID
   * @param {string} reportId - Report ID
   */
  getById: async (reportId) => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()
    return { data, error }
  },

  /**
   * Update a report
   * @param {string} reportId - Report ID
   * @param {object} updateData - Data to update
   */
  update: async (reportId, updateData) => {
    const { data, error } = await supabase
      .from('reports')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
    return { data, error }
  },

  /**
   * Delete a report
   * @param {string} reportId - Report ID
   */
  delete: async (reportId) => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
    return { error }
  }
}

/**
 * Storage functions for file uploads
 */
export const storage = {
  /**
   * Upload a file to Supabase storage
   * @param {string} bucket - Storage bucket name
   * @param {string} filePath - File path in bucket
   * @param {File} file - File to upload
   */
  upload: async (bucket, filePath, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    return { data, error }
  },

  /**
   * Get public URL for a file
   * @param {string} bucket - Storage bucket name
   * @param {string} filePath - File path in bucket
   */
  getPublicUrl: (bucket, filePath) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    return data.publicUrl
  },

  /**
   * Delete a file from storage
   * @param {string} bucket - Storage bucket name
   * @param {string} filePath - File path in bucket
   */
  delete: async (bucket, filePath) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    return { error }
  }
}

/**
 * Real-time subscriptions
 */
export const subscriptions = {
  /**
   * Subscribe to reports table changes
   * @param {function} callback - Callback function for changes
   */
  subscribeToReports: (callback) => {
    return supabase
      .channel('reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' },
        callback
      )
      .subscribe()
  },

  /**
   * Unsubscribe from a channel
   * @param {object} subscription - Subscription object
   */
  unsubscribe: (subscription) => {
    supabase.removeChannel(subscription)
  }
}

export default {
  supabase,
  auth,
  reports,
  storage,
  subscriptions
}
