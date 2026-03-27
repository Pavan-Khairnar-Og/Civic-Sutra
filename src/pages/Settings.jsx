import React, { useState } from 'react'
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Update user profile
  const updateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          notifications: formData.notifications,
          emailAlerts: formData.emailAlerts,
          locationSharing: formData.locationSharing
        }
      })

      if (error) throw error

      setSuccess('Profile updated successfully!')
    } catch (error) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      setError('Failed to sign out')
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
                    className="text-danger hover:bg-danger/10"
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Settings Tabs */}
          <div className="flex space-x-1 mb-6 border-b border-border/20">
            {['profile', 'notifications', 'privacy', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 font-medium text-sm capitalize transition-colors
                  ${activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-secondary hover:text-primary'
                  }
                `}
              >
                {tab}
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
                        Update Profile
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
                          name="notifications"
                          checked={formData.notifications}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                          name="emailAlerts"
                          checked={formData.emailAlerts}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                          name="locationSharing"
                          checked={formData.locationSharing}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                      <Button variant="outline" size="sm">
                        View Privacy Policy
                      </Button>
                    </Card>

                    <Card className="p-4 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Account Data</h4>
                      <p className="text-sm text-secondary mb-3">
                        You can request a copy of your data or delete your account at any time.
                      </p>
                      <div className="flex space-x-3">
                        <Button variant="outline" size="sm">
                          Download Data
                        </Button>
                        <Button variant="danger" size="sm">
                          Delete Account
                        </Button>
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
    </div>
  )
}

export default Settings
