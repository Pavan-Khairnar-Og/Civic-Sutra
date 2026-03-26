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
        data: metadata,
        emailRedirectTo: window.location.origin + '/login'
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
   */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

/**
 * Create a test user (for development only)
 * @param {string} email - Test email
 * @param {string} password - Test password
 * @param {string} role - User role
 */
export const createTestUser = async (email = 'test@civicsutra.com', password = 'test123456', role = 'citizen') => {
  console.log('Creating test user:', email)
  
  // First try to sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        role: role,
        full_name: 'Test User',
        created_at: new Date().toISOString()
      },
      emailRedirectTo: window.location.origin + '/login'
    }
  })

  if (error) {
    // If user already exists, try to sign in to verify
    if (error.message.includes('already registered')) {
      console.log('User already exists, attempting to sign in...')
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { 
        success: true, 
        message: 'Test user already exists and is valid',
        user: signInResult.data.user 
      }
    }
    return { success: false, error: error.message }
  }

  // For development, we might need to confirm the email manually
  // Check if the user was created but needs email confirmation
  if (data.user && !data.session) {
    console.log('User created but email confirmation required. For development, you may need to:')
    console.log('1. Disable email confirmation in Supabase project settings')
    console.log('2. Or manually confirm the email in Supabase dashboard')
    console.log('3. Or use the test user that bypasses email confirmation')
    
    return { 
      success: true, 
      message: 'Test user created successfully but email confirmation required',
      user: data.user,
      needsConfirmation: true
    }
  }

  return { 
    success: true, 
    message: 'Test user created and signed in successfully',
    user: data.user,
    session: data.session
  }
}

// Make function available globally for console access
if (typeof window !== 'undefined') {
  window.createTestUser = createTestUser
  
  // Add a simpler function for immediate testing
  window.createSimpleTestUser = async () => {
    console.log('Creating simple test user...')
    
    try {
      // Try to sign in first (in case user already exists)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@civicsutra.com',
        password: 'test123456'
      })
      
      if (signInData.user) {
        console.log('✅ Test user already exists and signed in!')
        return { success: true, message: 'Test user signed in successfully', user: signInData.user }
      }
      
      // If sign in fails, try to create the user
      console.log('Creating new test user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@civicsutra.com',
        password: 'test123456',
        options: {
          data: { 
            role: 'citizen',
            full_name: 'Test User',
            created_at: new Date().toISOString()
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      })
      
      if (signUpError) {
        console.error('❌ Failed to create test user:', signUpError)
        return { success: false, error: signUpError.message }
      }
      
      if (signUpData.user && !signUpData.session) {
        console.log('⚠️ Test user created but needs email confirmation')
        console.log('💡 Try disabling email confirmation in Supabase dashboard for development')
        return { 
          success: true, 
          message: 'Test user created but needs email confirmation',
          needsConfirmation: true,
          user: signUpData.user 
        }
      }
      
      console.log('✅ Test user created and signed in!')
      return { success: true, message: 'Test user created and signed in', user: signUpData.user }
      
    } catch (error) {
      console.error('❌ Error creating test user:', error)
      return { success: false, error: error.message }
    }
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
   * Update report status
   * @param {string} reportId - Report ID
   * @param {string} status - New status
   */
  updateStatus: async (reportId, status) => {
    const { data, error } = await supabase
      .from('reports')
      .update({
        status,
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
 * Image upload and report creation functions
 */
export const imageReports = {
  /**
   * Upload report image to Supabase Storage
   * @param {File} file - Image file to upload
   * @param {string} userId - User ID for folder structure
   * @returns {Promise<Object>} Object containing imageUrl and imagePath
   */
  uploadReportImage: async (file, userId) => {
    try {
      if (!file) {
        throw new Error('No file provided for upload')
      }

      // Handle anonymous users by generating a temporary folder
      let folderName = userId
      if (!userId || userId === 'anonymous') {
        // Generate a unique temporary folder for anonymous uploads
        folderName = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folderName}/${Date.now()}.${fileExt}`
      const filePath = `reports/${fileName}`

      console.log('Uploading image:', filePath)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Image upload failed: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      return {
        imageUrl: urlData.publicUrl,
        imagePath: filePath
      }

    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  },

  /**
   * Save complete report with AI analysis results
   * @param {object} reportData - Complete report data including AI results
   * @returns {Promise<Object>} Created report data
   */
  saveReport: async ({
    userId,
    citizenName,
    citizenEmail,
    title,
    description,
    location,
    imageUrl,
    imagePath,
    aiResult
  }) => {
    try {
      if (!imageUrl || !imagePath) {
        throw new Error('Image URL and path are required')
      }

      if (!aiResult) {
        throw new Error('AI analysis result is required')
      }

      // Allow anonymous submissions (userId can be null)
      const reportData = {
        user_id: userId || null, // Allow null for anonymous users
        citizen_name: citizenName || null,
        citizen_email: citizenEmail || null,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || null,
        title: title || `AI Detected: ${aiResult.issueType}`,
        description: description || aiResult.description,
        issue_type: aiResult.issueType,
        ai_issue_type: aiResult.issueType,
        ai_department: aiResult.suggestedDepartment,
        ai_severity: aiResult.severity,
        ai_description: aiResult.description,
        ai_reasoning: aiResult.reasoning,
        ai_confidence: aiResult.confidence,
        ai_valid: aiResult.isValidCivicIssue,
        image_url: imageUrl,
        image_path: imagePath,
        status: 'pending',
        assigned_department: aiResult.suggestedDepartment,
        priority: 'medium', // Will be calculated by trigger
        priority_score: 0, // Will be calculated by trigger
        is_duplicate: false,
        duplicate_of: null,
        upvotes: 0,
        confirmations: 0
      }

      console.log('Saving report:', reportData)

      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single()

      if (error) {
        console.error('Report save error:', error)
        throw new Error(`Failed to save report: ${error.message}`)
      }

      console.log('Report saved successfully:', data)
      return data

    } catch (error) {
      console.error('Save report error:', error)
      throw error
    }
  },

  /**
   * Get all reports with full details
   * @param {object} options - Query options
   * @returns {Promise<Object>} Reports data
   */
  getAllReports: async (options = {}) => {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          user:auth.users(
            email,
            user_metadata
          )
        `)

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending || false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.priority) {
        query = query.eq('priority', options.priority)
      }
      if (options.aiIssueType) {
        query = query.eq('ai_issue_type', options.aiIssueType)
      }
      if (options.assignedDepartment) {
        query = query.eq('assigned_department', options.assignedDepartment)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Get all reports error:', error)
        throw new Error(`Failed to fetch reports: ${error.message}`)
      }

      return { data, error }

    } catch (error) {
      console.error('Get all reports error:', error)
      throw error
    }
  },

  /**
   * Get reports for current user
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<Object>} User reports data
   */
  getMyReports: async (userId, options = {}) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      let query = supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.priority) {
        query = query.eq('priority', options.priority)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Get my reports error:', error)
        throw new Error(`Failed to fetch user reports: ${error.message}`)
      }

      return { data, error }

    } catch (error) {
      console.error('Get my reports error:', error)
      throw error
    }
  },

  /**
   * Update report status
   * @param {string} reportId - Report ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated report data
   */
  updateReportStatus: async (reportId, status) => {
    try {
      if (!reportId) {
        throw new Error('Report ID is required')
      }

      if (!status) {
        throw new Error('Status is required')
      }

      const { data, error } = await supabase
        .from('reports')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) {
        console.error('Update status error:', error)
        throw new Error(`Failed to update report status: ${error.message}`)
      }

      return { data, error }

    } catch (error) {
      console.error('Update report status error:', error)
      throw error
    }
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
  imageReports,
  storage,
  subscriptions
}
