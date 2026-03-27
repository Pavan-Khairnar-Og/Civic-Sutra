import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'

/**
 * Settings Page Component
 * User profile and application settings with role-based features
 * Modern glass morphism design with comprehensive settings options
 */
const Settings = () => {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated, isGov, isAnonymous } = useAuth()

  // Derived role variables
  const isAdmin = user?.role === 'admin'
  const isGovernment = isGov
  const isCitizen = !isAnonymous && !isGov && !isAdmin

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    notifications: user?.user_metadata?.notifications !== false,
    emailAlerts: user?.user_metadata?.emailAlerts !== false,
    locationSharing: user?.user_metadata?.locationSharing !== false
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    push_notifications: false,
    email_alerts: true,
    location_sharing: true
  })

  // Modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load notification preferences on mount
  useEffect(() => {
    if (user && !isAnonymous) {
      loadNotificationPrefs()
    }
  }, [user, isAnonymous])

  // Load notification preferences from Supabase
  const loadNotificationPrefs = async () => {
    try {
      const { data } = await supabase
        .from('notification_prefs')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setNotificationPrefs({
          push_notifications: data.push_notifications || false,
          email_alerts: data.email_alerts !== false,
          location_sharing: data.location_sharing !== false
        })
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  // Save notification preferences to Supabase
  const saveNotificationPrefs = async (prefs) => {
    try {
      const { error } = await supabase
        .from('notification_prefs')
        .upsert({
          user_id: user?.id,
          ...prefs,
          updated_at: new Date()
        })
        .eq('user_id', user?.id)

      if (error) throw error
      setNotificationPrefs(prev => ({ ...prev, ...prefs }))
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Update profile in Supabase
  const updateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: formData.fullName,
          phone_number: formData.phone,
          updated_at: new Date()
        })
        .eq('id', user?.id)

      if (error) throw error

      setSuccess('Profile updated successfully')
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          user_metadata: {
            ...user?.user_metadata,
            full_name: formData.fullName,
            phone: formData.phone
          }
        }
      })
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Handle notification toggle
  const handleNotificationToggle = async (type, value) => {
    await saveNotificationPrefs({ [type]: value })
  }

  // Handle download data
  const handleDownloadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch user's data
      const [profile, issues, notificationPrefs] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('issues').select('*').eq('user_id', user?.id),
        supabase.from('notification_prefs').select('*').eq('user_id', user?.id).single()
      ])

      const userData = {
        profile: profile.data,
        issues: issues.data,
        notificationPrefs: notificationPrefs.data
      }

      // Trigger download
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'civicsutra-my-data.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess('Your data has been downloaded')
    } catch (error) {
      setError('Failed to download data')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setError('')

    try {
      // Call API to delete account
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id })
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      // Sign out and redirect
      await logout()
      navigate('/')
    } catch (error) {
      setError('Failed to delete account')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  // Get role badge variant
  const getRoleBadgeVariant = () => {
    if (isAdmin) return 'danger'
    if (isGovernment) return 'secondary'
    if (isCitizen) return 'primary'
    return 'muted'
  }

  // Get role display text
  const getRoleDisplayText = () => {
    if (isAdmin) return 'Administrator'
    if (isGovernment) return 'Government Employee'
    if (isCitizen) return 'Citizen'
    return 'Anonymous User'
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
            <p className="text-secondary">Manage your profile and application preferences</p>
          </div>

          {/* User Info Card */}
          <Card className="mb-6 glass border border-border/20">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || (isAnonymous ? 'A' : 'U')}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-primary">
                    {isAnonymous ? 'Anonymous User' : formData.fullName || 'User'}
                  </h2>
                  <p className="text-secondary">{user?.email}</p>
                  <Badge variant={getRoleBadgeVariant()} size="sm" className="mt-2">
                    {getRoleDisplayText()}
                  </Badge>
                </div>
                {!isAnonymous && (
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="text-civic-orange hover:bg-civic-orange/90 hover:text-white"
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Settings Tabs */}
          <div className="flex space-x-1 mb-6 border-b border-civic-muted/20">
            {['profile', 'notifications', 'privacy', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === tab 
                    ? 'text-civic-orange border-civic-orange' 
                    : 'text-civic-textSecondary hover:text-civic-textPrimary'
                }`}
                style={{
                  borderBottom: activeTab === tab ? '2px solid #c2410c' : 'none'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-civic-orange"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <Card className="glass border border-border/20">
            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Profile Information</h3>
                  
                  {isAnonymous ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="text-lg font-medium text-primary mb-2">Anonymous Mode</h4>
                      <p className="text-secondary mb-4">
                        You're currently browsing as an anonymous user. 
                        To save your profile information, please sign in or create an account.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/login')}
                      >
                        Sign In to Save Profile
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={updateProfile} className="space-y-4">
                      <Input
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                      
                      <Input
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        disabled
                        helperText="Email cannot be changed here"
                      />
                      
                      <Input
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        type="tel"
                      />
                      
                      {error && (
                        <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
                          <p className="text-sm text-danger">{error}</p>
                        </div>
                      )}
                      
                      {success && (
                        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                          <p className="text-sm text-success">{success}</p>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        className="w-full"
                      >
                        {loading ? 'Saving…' : 'Save Changes'}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-primary">Push Notifications</h4>
                        <p className="text-sm text-secondary">Receive notifications about your reports</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.push_notifications}
                          onChange={(e) => handleNotificationToggle('push_notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-civic-orange"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-primary">Email Alerts</h4>
                        <p className="text-sm text-secondary">Get email updates about report status</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.email_alerts}
                          onChange={(e) => handleNotificationToggle('email_alerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-civic-orange"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-primary">Location Sharing</h4>
                        <p className="text-sm text-secondary">Share location when reporting issues</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.location_sharing}
                          onChange={(e) => handleNotificationToggle('location_sharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-civic-orange"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <Card className="p-4 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Data Collection</h4>
                      <p className="text-sm text-secondary mb-3">
                        We collect minimal data necessary to provide our services. Your information is never sold to third parties.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPrivacyModal(true)}
                      >
                        View Privacy Policy
                      </Button>
                    </Card>
                    
                    <Card className="p-4 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Account Data</h4>
                      <p className="text-sm text-secondary mb-3">
                        You can request a copy of your data or delete your account at any time.
                      </p>
                      <div className="flex space-x-3">
                        <Button variant="outline" size="sm" onClick={handleDownloadData} loading={loading}>
                          {loading ? 'Preparing…' : 'Download Data'}
                        </Button>
                        {!isAnonymous && (
                          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                            Delete Account
                          </Button>
                        )}
                      </div>
                    </Card>
                    
                    {isAnonymous && (
                      <Card className="p-4 bg-muted/20 border border-border/20">
                        <h4 className="font-medium text-primary mb-2">Anonymous Browsing</h4>
                        <p className="text-sm text-secondary">
                          You're currently browsing anonymously. No personal data is being stored.
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">About Civic Sutra</h3>
                  
                  <div className="space-y-4">
                    <Card className="p-4 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">App Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary">Version</span>
                          <span className="text-primary">1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">Role</span>
                          <Badge variant={getRoleBadgeVariant()} size="sm">
                            {getRoleDisplayText()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">Theme</span>
                          <span className="text-primary">{isDark ? 'Dark' : 'Light'}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Features</h4>
                      <ul className="space-y-2 text-sm text-secondary">
                        <li>• Report civic issues with AI analysis</li>
                        <li>• Track issue status in real-time</li>
                        <li>• Interactive map view</li>
                        <li>• Role-based access control</li>
                        <li>• Anonymous reporting</li>
                      </ul>
                    </Card>

                    <Card className="p-4 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Support</h4>
                      <div className="space-y-3">
                        <Button variant="outline" size="sm" className="w-full">
                          📧 Contact Support
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          📖 User Guide
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          🐛 Report Bug
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-primary">Privacy Policy — Civic Sutra</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivacyModal(false)}
              >
                X
              </Button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-primary mb-2">Data Collection</h4>
                <p className="text-secondary mb-3">
                  Civic Sutra collects only the information necessary to provide our civic issue reporting services. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-secondary ml-4">
                  <li>Account information (email, name, phone number)</li>
                  <li>Issue reports (title, description, location, photos)</li>
                  <li>Device information for service optimization</li>
                  <li>Usage analytics to improve our services</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-2">How We Use Your Data</h4>
                <p className="text-secondary mb-3">
                  Your data is used to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-secondary ml-4">
                  <li>Process and analyze your issue reports</li>
                  <li>Provide location-based civic services</li>
                  <li>Generate insights for municipal authorities</li>
                  <li>Improve service delivery and user experience</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-2">Data Sharing</h4>
                <p className="text-secondary mb-3">
                  We share your data only when necessary:
                </p>
                <ul className="list-disc list-inside space-y-2 text-secondary ml-4">
                  <li>With municipal authorities for issue resolution</li>
                  <li>With service providers for essential functionality</li>
                  <li>Anonymized statistics for research and improvement</li>
                  <li>Never sold to third parties for marketing</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-2">Your Rights</h4>
                <p className="text-secondary mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-secondary ml-4">
                  <li>Access all your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and all associated data</li>
                  <li>Request data export at any time</li>
                  <li>Opt out of data collection and analysis</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-2">Contact Us</h4>
                <p className="text-secondary">
                  If you have questions about this privacy policy or our data practices, please contact us at:
                </p>
                <p className="text-primary">privacy@civicsutra.in</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-primary">Delete your account?</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                X
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-secondary mb-4">
                This will permanently delete your account, all your reports, and associated data. This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  loading={deleteLoading}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
