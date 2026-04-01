import { supabase } from '../services/supabase' // use existing supabase client

// Get profile for current user
export const getProfile = async (userId) => {
  console.log('Getting profile for user:', userId)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()  // ← Fixed: use maybeSingle() instead of single()
  
  console.log('Profile query result:', { data, error })
  
  if (error) throw error
  return data || null
}

// Update profile
export const updateProfile = async (userId, updates) => {
  console.log('Updating profile for user:', userId, 'with updates:', updates)
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates
    })
    .select()
    .maybeSingle()
  
  console.log('Update result:', { data, error })
  
  if (error) {
    console.error('Update error:', error)
    throw error
  }
  
  // Handle both single object and array responses
  if (Array.isArray(data)) {
    // Update returned an array (empty or with results)
    if (data.length > 0) {
      return data[0] // Return first item if array has items
    } else {
      // Empty array returned - no changes needed or profile not found
      return null
    }
  } else {
    // Single object returned
    return data
  }
}

// Check if username is available
export const checkUsernameAvailable = async (username, currentUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username.toLowerCase())
    .neq('id', currentUserId) // exclude current user
    .maybeSingle()
  
  if (error) throw error
  return data === null // true = available, false = taken
}

// Get profile by username (public)
export const getProfileByUsername = async (username) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, city, role, created_at')
    .eq('username', username.toLowerCase())
    .maybeSingle()  // ← Fixed: use maybeSingle() instead of single()
  
  if (error) throw error
  return data
}
