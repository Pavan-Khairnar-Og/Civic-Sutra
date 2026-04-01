import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { getProfile, updateProfile, checkUsernameAvailable } from '../services/profileService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'

// Toggle component
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-[#D4522A]' : 'bg-[#C8C4BC]'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

/**
 * Settings Page Component
 *
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

  // Profile state
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('idle')
  // 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'unchanged'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const usernameTimeout = useRef(null)

  // UI state
  const [activeTab, setActiveTab] = useState('profile')

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    push: false,
    email: true,
    location: true,
    statusUpdates: true,
    newFeatures: false,
  })

  // Modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const data = await getProfile(user.id)
        setProfile(data)
        setFullName(data?.full_name || '')
        setUsername(data?.username || '')
        setPhone(data?.phone || '')
        setBio(data?.bio || '')
        setCity(data?.city || '')
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Failed to load profile data')
      } finally {
        setPageLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Load notification preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('civicsutra_notifications')
      if (saved) setNotifications(JSON.parse(saved))
    } catch (e) {}
  }, [])

  // Username real-time availability check (debounced 600ms)
  const handleUsernameChange = (value) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_.]/g, '')
    setUsername(cleaned)
    setUsernameStatus('idle')
    setError('')

    if (usernameTimeout.current) clearTimeout(usernameTimeout.current)
    if (!cleaned || cleaned.length < 3) {
      setUsernameStatus('idle')
      return
    }

    if (cleaned === profile?.username?.toLowerCase()) {
      setUsernameStatus('unchanged')
      return
    }

    setUsernameStatus('checking')

    usernameTimeout.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const isAvailable = await checkUsernameAvailable(cleaned, user.id)
        setUsernameStatus(isAvailable ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 600)
  }

  // Save profile
  const handleSaveProfile = async () => {
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Display name cannot be empty')
      return
    }
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (usernameStatus === 'taken') {
      setError('This username is already taken')
      return
    }
    if (usernameStatus === 'checking') {
      setError('Please wait while we check username availability')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const updated = await updateProfile(user.id, {
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
        bio: bio.trim(),
        city: city.trim(),
      })

      if (updated) { // Check if update was successful (single object)
        setProfile(updated)
        setUsernameStatus('unchanged')
        toast.success('Profile updated successfully!')
      } else {
        // Handle case where no profile was found to update
        setError('Profile not found or no changes applied.')
        toast.error('Failed to update profile: no record found.')
      }

    } catch (err) {
      console.error(err)
      if (err.code === '23505') {
        setError('Username already taken. Please choose another.')
        setUsernameStatus('taken')
      } else {
        setError('Failed to save profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Toggle notification
  const toggleNotification = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] }
      localStorage.setItem('civicsutra_notifications', JSON.stringify(updated))
      return updated
    })
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Handle download data
  const handleDownloadData = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      // Use existing profile data from state instead of making fresh API call
      const profileData = profile

      const userData = {
        profile: profileData || null,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'civicsutra-my-data.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Your data has been downloaded')
    } catch (error) {
      console.error('Download error:', error)
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
    if (isGovernment) return 'warning'
    if (isCitizen) return 'primary'
    return 'muted'
  }

  // Get role display text
  const getRoleDisplayText = () => {
    if (isAdmin) return 'Administrator'
    if (isGovernment) return 'Government Official'
    if (isCitizen) return 'Citizen'
    return 'Anonymous User'
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f2ed] dark:bg-[#1e1a17] py-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary dark:text-[#e8e0d5] mb-2">Settings</h1>
              <p className="text-secondary dark:text-[#a89880]">Manage your profile and application preferences</p>
            </div>

            {/* User Info Card */}
            <Card className="mb-6 glass border border-[#E8E4DC]/20 dark:bg-[#2d3748] dark:border-[#4a5568]">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      isDark ? 'bg-[#D4522A]/20 text-[#D4522A]' : 'bg-[#FBF0EB] text-[#D4522A]'
                    }`}>
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-xl font-semibold ${isDark ? 'text-[#E8E4DC]' : 'text-[#1C1917]'}`}>
                        {profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User'}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-[#A89880]' : 'text-[#737373]'}`}>
                        {profile?.username || user?.email || 'No email'}
                      </p>
                      <Badge variant={getRoleBadgeVariant()} size="sm" className="mt-2">
                        {getRoleDisplayText()}
                      </Badge>
                    </div>
                  </div>
                  {!isAnonymous && (
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="text-[#D4522A] hover:bg-[#D4522A]/90 hover:text-white"
                    >
                      Sign Out
                    </Button>
                  )}
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-white dark:bg-[#26221e] border-b border-[#E8E4DC] dark:border-[#4a4035]">
                  {['profile', 'notifications', 'privacy', 'about'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                        activeTab === tab
                          ? 'text-orange-500'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      style={{
                        borderBottom: activeTab === tab ? '2px solid orange-500' : '2px solid transparent'
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              </Card>

                {/* Tab Content */}
                <div className={`rounded-2xl border ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-white border-[#E8E4DC]'}`}>
                  <div className="p-6">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary dark:text-[#e8e0d5] mb-4">Profile Information</h3>

                        {isAnonymous ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#F8F6F1] rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">🔒</span>
                            </div>
                            <h4 className="text-lg font-medium text-primary dark:text-[#e8e0d5] mb-2">Anonymous Mode</h4>
                            <p className="text-secondary dark:text-[#a89880] mb-4">
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
                          <div className="space-y-5">

                            {/* Display Name */}
                            <div>
                              <label className="block text-sm font-medium text-[#1C1917] dark:text-[#E8E4DC] mb-1.5">
                                Display Name
                              </label>
                              <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-3 text-[#1C1917] focus:border-[#D4522A] focus:ring-2 focus:ring-[#D4522A]/10 outline-none transition-all"
                              />
                            </div>

                            {/* Username */}
                            <div>
                              <label className="block text-sm font-medium text-[#1C1917] dark:text-[#E8E4DC] mb-1.5">
                                Username
                                <span className="text-[#6B6560] font-normal ml-1 text-xs">(unique, shown publicly)</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6560] text-sm select-none">
                                  @
                                </span>
                                <input
                                  type="text"
                                  value={username}
                                  onChange={(e) => handleUsernameChange(e.target.value)}
                                  placeholder="yourname"
                                  maxLength={30}
                                  className={`w-full bg-[#F8F6F1] border rounded-xl pl-8 pr-10 py-3 text-[#1C1917] outline-none transition-all
                                    ${usernameStatus === 'taken'
                                      ? 'border-[#C1121F] focus:ring-2 focus:ring-[#C1121F]/10'
                                      : usernameStatus === 'available'
                                      ? 'border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/10'
                                      : 'border-[#E8E4DC] focus:border-[#D4522A] focus:ring-2 focus:ring-[#D4522A]/10'
                                    }`}
                                />
                                {/* Status icon inside input */}
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {usernameStatus === 'checking' && (
                                    <svg className="animate-spin w-4 h-4 text-[#6B6560]" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                  )}
                                  {usernameStatus === 'available' && (
                                    <svg className="w-4 h-4 text-[#2A9D8F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  {usernameStatus === 'taken' && (
                                    <svg className="w-4 h-4 text-[#C1121F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                  {usernameStatus === 'unchanged' && (
                                    <svg className="w-4 h-4 text-[#6B6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                  )}
                                </span>
                              </div>
                              {/* Status message */}
                              <p className={`text-xs mt-1.5 ${
                                usernameStatus === 'taken'
                                  ? 'text-[#C1121F]'
                                  : usernameStatus === 'available'
                                  ? 'text-[#2A9D8F]'
                                  : 'text-[#6B6560]'
                              }`}>
                                {usernameStatus === 'taken' && '✗ Username already taken'}
                                {usernameStatus === 'available' && '✓ Username is available!'}
                                {usernameStatus === 'checking' && 'Checking availability...'}
                                {usernameStatus === 'unchanged' && 'This is your current username'}
                                {usernameStatus === 'idle' && username.length > 0 && username.length < 3 && 'Minimum 3 characters'}
                                {usernameStatus === 'idle' && username.length === 0 && 'Letters, numbers, underscores and dots only'}
                              </p>
                            </div>

                            {/* Email (read only) */}
                            <div>
                              <label className="block text-sm font-medium text-[#1C1917] dark:text-[#E8E4DC] mb-1.5">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="w-full bg-[#E8E4DC] border border-[#E8E4DC] rounded-xl px-4 py-3 text-[#6B6560] cursor-not-allowed"
                              />
                              <p className="text-xs text-[#6B6560] mt-1">Email cannot be changed here</p>
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="block text-sm font-medium text-[#1C1917] dark:text-[#E8E4DC] mb-1.5">
                                Phone Number
                                <span className="text-[#6B6560] font-normal ml-1 text-xs">(optional)</span>
                              </label>
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-3 text-[#1C1917] focus:border-[#D4522A] focus:ring-2 focus:ring-[#D4522A]/10 outline-none transition-all"
                              />
                            </div>

                            {/* City */}
                            <div>
                              <label className="block text-sm font-medium text-[#1C1917] dark:text-[#E8E4DC] mb-1.5">City</label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Mumbai, Maharashtra"
                                className="w-full bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-3 text-[#1C1917] focus:border-[#D4522A] focus:ring-2 focus:ring-[#D4522A]/10 outline-none transition-all"
                              />
                            </div>

                            {/* Bio */}
                            <div>
                              <label className="block text-sm font-medium text-[#1C1917] dark:text-[#E8E4DC] mb-1.5">
                                Bio
                                <span className="text-[#6B6560] font-normal ml-1 text-xs">(optional)</span>
                              </label>
                              <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us a bit about yourself..."
                                rows={3}
                                maxLength={160}
                                className="w-full bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-3 text-[#1C1917] focus:border-[#D4522A] focus:ring-2 focus:ring-[#D4522A]/10 outline-none transition-all resize-none"
                              />
                              <p className="text-xs text-[#6B6560] text-right mt-1">{bio.length}/160</p>
                            </div>

                            {/* Inline error message */}
                            {error && (
                              <div className="bg-[#FCEAEA] border border-[#C1121F]/20 rounded-xl px-4 py-3 text-[#C1121F] text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                              </div>
                            )}

                            {/* Save button */}
                            <button
                              onClick={handleSaveProfile}
                              disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking'}
                              className="w-full bg-[#D4522A] hover:bg-[#B8441F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-full py-3 transition-all duration-200 flex items-center justify-center gap-2"
                              type="button"
                            >
                              {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary dark:text-[#e8e0d5] mb-4">Notification Preferences</h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-[#F8F6F1]/50 dark:bg-[#2e2924] rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary dark:text-[#e8e0d5]">Push Notifications</h4>
                              <p className="text-sm text-secondary dark:text-[#a89880]">Receive notifications about your reports</p>
                            </div>
                            <Toggle checked={notifications.push} onChange={() => toggleNotification('push')} />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-[#F8F6F1]/50 dark:bg-[#2e2924] rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary dark:text-[#e8e0d5]">Email Alerts</h4>
                              <p className="text-sm text-secondary dark:text-[#a89880]">Get email updates about report status</p>
                            </div>
                            <Toggle checked={notifications.email} onChange={() => toggleNotification('email')} />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-[#F8F6F1]/50 dark:bg-[#2e2924] rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary dark:text-[#e8e0d5]">Location Sharing</h4>
                              <p className="text-sm text-secondary dark:text-[#a89880]">Share location when reporting issues</p>
                            </div>
                            <Toggle checked={notifications.location} onChange={() => toggleNotification('location')} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Privacy Tab */}
                    {activeTab === 'privacy' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary dark:text-[#e8e0d5] mb-4">Privacy Settings</h3>

                        <div className="space-y-4">
                          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-white border-[#E8E4DC]'}`}>
                            <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Data Collection</h4>
                            <p className="text-sm text-secondary dark:text-[#a89880] mb-3">
                              We collect minimal data necessary to provide our services. Your information is never sold to third parties.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPrivacyModal(true)}
                            >
                              View Privacy Policy
                            </Button>
                          </div>

                          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-white border-[#E8E4DC]'}`}>
                            <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Account Data</h4>
                            <p className="text-sm text-secondary dark:text-[#a89880] mb-3">
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
                          </div>

                          {isAnonymous && (
                            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-[#F8F6F1] border-[#E8E4DC]'}`}>
                              <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Anonymous Browsing</h4>
                              <p className="text-sm text-secondary dark:text-[#a89880]">
                                You're currently browsing anonymously. No personal data is being stored.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary dark:text-[#e8e0d5] mb-4">About Civic Sutra</h3>

                        <div className="space-y-4">
                          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-white border-[#E8E4DC]'}`}>
                            <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">App Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-secondary dark:text-[#a89880]">Version</span>
                                <span className="text-primary dark:text-[#e8e0d5]">1.0.0</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary dark:text-[#a89880]">Role</span>
                                <Badge variant={getRoleBadgeVariant()} size="sm">
                                  {getRoleDisplayText()}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary dark:text-[#a89880]">Theme</span>
                                <span className="text-primary dark:text-[#e8e0d5]">{isDark ? 'Dark' : 'Light'}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-white border-[#E8E4DC]'}`}>
                            <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Features</h4>
                            <ul className="space-y-2 text-sm text-secondary dark:text-[#a89880]">
                              <li>• Report civic issues with AI analysis</li>
                              <li>• Track issue status in real-time</li>
                              <li>• Interactive map view</li>
                              <li>• Role-based access control</li>
                              <li>• Anonymous reporting</li>
                            </ul>
                          </div>

                          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1A] border-[#2C2C2A]' : 'bg-white border-[#E8E4DC]'}`}>
                            <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Support</h4>
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#302b26] rounded-2xl p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-primary dark:text-[#e8e0d5]">Privacy Policy — Civic Sutra</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPrivacyModal(false)}>✕</Button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Data Collection</h4>
                <p className="text-secondary dark:text-[#a89880] mb-3">
                  Civic Sutra collects only information necessary to provide our civic issue reporting services. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-secondary dark:text-[#a89880] ml-4">
                  <li>Account information (email, name, phone number)</li>
                  <li>Issue reports (title, description, location, photos)</li>
                  <li>Device information for service optimization</li>
                  <li>Usage analytics to improve our services</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">How We Use Your Data</h4>
                <p className="text-secondary dark:text-[#a89880] mb-3">Your data is used to:</p>
                <ul className="list-disc list-inside space-y-2 text-secondary dark:text-[#a89880] ml-4">
                  <li>Process and analyze your issue reports</li>
                  <li>Provide location-based civic services</li>
                  <li>Generate insights for municipal authorities</li>
                  <li>Improve service delivery and user experience</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Data Sharing</h4>
                <p className="text-secondary dark:text-[#a89880] mb-3">We share your data only when necessary:</p>
                <ul className="list-disc list-inside space-y-2 text-secondary dark:text-[#a89880] ml-4">
                  <li>With municipal authorities for issue resolution</li>
                  <li>With service providers for essential functionality</li>
                  <li>Anonymized statistics for research and improvement</li>
                  <li>Never sold to third parties for marketing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Your Rights</h4>
                <p className="text-secondary dark:text-[#a89880] mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-secondary dark:text-[#a89880] ml-4">
                  <li>Access all your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and all associated data</li>
                  <li>Request data export at any time</li>
                  <li>Opt out of data collection and analysis</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-primary dark:text-[#e8e0d5] mb-2">Contact Us</h4>
                <p className="text-secondary dark:text-[#a89880]">
                  If you have questions about this privacy policy or our data practices, please contact us at:
                </p>
                <p className="text-primary dark:text-[#e8e0d5]">privacy@civicsutra.in</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#302b26] rounded-2xl p-6 max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-primary dark:text-[#e8e0d5]">Delete your account?</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>✕</Button>
            </div>

            <div className="space-y-4">
              <p className="text-secondary dark:text-[#a89880] mb-4">
                This will permanently delete your account, all your reports, and associated data. This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteAccount} loading={deleteLoading}>
                  {deleteLoading ? 'Deleting…' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Settings
